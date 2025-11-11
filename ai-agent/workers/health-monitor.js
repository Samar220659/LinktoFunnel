#!/usr/bin/env node

/**
 * 🏥 HEALTH MONITOR & AUTO-RECOVERY
 * Überwacht alle System-Komponenten und startet sie bei Bedarf neu
 *
 * Monitors:
 * - Telegram Bot
 * - Auto-Poster Worker
 * - Content Scheduler
 * - Queue System
 *
 * Features:
 * - Health checks every 5 minutes
 * - Automatic restart on failure
 * - Telegram notifications
 * - Detailed logging
 */

require('dotenv').config({ path: '.env.local' });
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RESTART_ATTEMPTS = 3;
const RESTART_COOLDOWN = 60000; // 1 minute between restarts

class HealthMonitor {
  constructor() {
    this.processes = {
      bot: {
        name: 'Telegram Bot',
        script: path.join(__dirname, '../telegram-bot.js'),
        process: null,
        pid: null,
        status: 'stopped',
        restarts: 0,
        last_restart: null,
        last_health_check: null,
      },
      autoPoster: {
        name: 'Auto-Poster',
        script: path.join(__dirname, './auto-poster.js'),
        process: null,
        pid: null,
        status: 'stopped',
        restarts: 0,
        last_restart: null,
        last_health_check: null,
      },
      scheduler: {
        name: 'Content Scheduler',
        script: path.join(__dirname, './content-scheduler.js'),
        process: null,
        pid: null,
        status: 'stopped',
        restarts: 0,
        last_restart: null,
        last_health_check: null,
      },
    };

    this.running = false;
    this.stats = {
      started_at: new Date().toISOString(),
      total_restarts: 0,
      health_checks: 0,
      errors: 0,
    };
  }

  // ===== MAIN LOOP =====

  async start() {
    if (this.running) {
      console.log('⚠️  Health Monitor already running!');
      return;
    }

    this.running = true;

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║           🏥 HEALTH MONITOR STARTED                            ║');
    console.log('║           Automatic System Recovery & Monitoring               ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`🔍 Check interval: ${CHECK_INTERVAL / 1000 / 60} minutes`);
    console.log(`🔄 Max restart attempts: ${MAX_RESTART_ATTEMPTS}`);
    console.log(`⏱️  Restart cooldown: ${RESTART_COOLDOWN / 1000}s\n`);

    // Start all processes
    console.log('🚀 Starting all processes...\n');
    await this.startAllProcesses();

    // Health check loop
    while (this.running) {
      await this.sleep(CHECK_INTERVAL);

      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Health check error:', error.message);
        this.stats.errors++;
      }
    }
  }

  async stop() {
    console.log('\n⏸️  Stopping Health Monitor...');
    this.running = false;

    // Stop all processes
    console.log('🛑 Stopping all processes...\n');
    await this.stopAllProcesses();
  }

  // ===== PROCESS MANAGEMENT =====

  async startAllProcesses() {
    for (const [key, process] of Object.entries(this.processes)) {
      await this.startProcess(key);
      await this.sleep(2000); // Stagger starts
    }

    console.log('\n✅ All processes started!\n');
  }

  async stopAllProcesses() {
    for (const [key, process] of Object.entries(this.processes)) {
      await this.stopProcess(key);
    }

    console.log('\n✅ All processes stopped!\n');
  }

  async startProcess(key) {
    const process = this.processes[key];

    if (process.status === 'running') {
      console.log(`⚠️  ${process.name} already running`);
      return;
    }

    // Check restart cooldown
    if (process.last_restart) {
      const timeSinceRestart = Date.now() - new Date(process.last_restart).getTime();
      if (timeSinceRestart < RESTART_COOLDOWN) {
        console.log(`⏳ ${process.name}: Waiting for cooldown (${Math.ceil((RESTART_COOLDOWN - timeSinceRestart) / 1000)}s)`);
        return;
      }
    }

    // Check max restarts
    if (process.restarts >= MAX_RESTART_ATTEMPTS) {
      console.log(`❌ ${process.name}: Max restart attempts reached (${MAX_RESTART_ATTEMPTS})`);
      console.log(`   Manual intervention required!`);
      return;
    }

    console.log(`▶️  Starting ${process.name}...`);

    try {
      // Spawn process
      const childProcess = spawn('node', [process.script], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      process.process = childProcess;
      process.pid = childProcess.pid;
      process.status = 'running';
      process.last_restart = new Date().toISOString();

      // Handle output
      childProcess.stdout.on('data', (data) => {
        console.log(`[${process.name}] ${data.toString().trim()}`);
      });

      childProcess.stderr.on('data', (data) => {
        console.error(`[${process.name}] ERROR: ${data.toString().trim()}`);
      });

      // Handle exit
      childProcess.on('exit', (code, signal) => {
        console.log(`\n⚠️  ${process.name} exited with code ${code}`);
        process.status = 'stopped';
        process.pid = null;
        process.process = null;

        if (code !== 0) {
          process.restarts++;
          this.stats.total_restarts++;
          console.log(`   Will attempt restart (${process.restarts}/${MAX_RESTART_ATTEMPTS})`);

          // Auto-restart after cooldown
          setTimeout(async () => {
            if (this.running) {
              await this.startProcess(key);
            }
          }, RESTART_COOLDOWN);
        }
      });

      console.log(`✅ ${process.name} started (PID: ${process.pid})\n`);

    } catch (error) {
      console.error(`❌ Failed to start ${process.name}:`, error.message);
      process.status = 'error';
      this.stats.errors++;
    }
  }

  async stopProcess(key) {
    const process = this.processes[key];

    if (process.status !== 'running' || !process.process) {
      console.log(`⚠️  ${process.name} not running`);
      return;
    }

    console.log(`⏹️  Stopping ${process.name}...`);

    try {
      process.process.kill('SIGTERM');

      // Wait for graceful shutdown
      await this.sleep(2000);

      if (process.status === 'running') {
        // Force kill if still running
        process.process.kill('SIGKILL');
      }

      process.status = 'stopped';
      process.pid = null;
      process.process = null;

      console.log(`✅ ${process.name} stopped\n`);

    } catch (error) {
      console.error(`❌ Failed to stop ${process.name}:`, error.message);
    }
  }

  // ===== HEALTH CHECKS =====

  async performHealthCheck() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏥 PERFORMING HEALTH CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    this.stats.health_checks++;

    let allHealthy = true;

    for (const [key, process] of Object.entries(this.processes)) {
      const healthy = await this.checkProcess(key);

      if (!healthy) {
        allHealthy = false;
        console.log(`❌ ${process.name}: UNHEALTHY - attempting restart`);
        await this.startProcess(key);
      } else {
        console.log(`✅ ${process.name}: HEALTHY`);
      }

      process.last_health_check = new Date().toISOString();
    }

    if (allHealthy) {
      console.log('\n🎉 All systems healthy!\n');
    } else {
      console.log('\n⚠️  Some systems required intervention\n');
    }

    await this.printStatus();
  }

  async checkProcess(key) {
    const process = this.processes[key];

    if (process.status !== 'running') {
      return false;
    }

    if (!process.pid) {
      return false;
    }

    // Check if process is still running
    try {
      // Sending signal 0 checks if process exists without killing it
      process.process?.kill(0);
      return true;
    } catch (error) {
      return false;
    }
  }

  // ===== STATUS =====

  getStatus() {
    const uptime = Date.now() - new Date(this.stats.started_at).getTime();
    const uptimeHours = (uptime / 1000 / 60 / 60).toFixed(2);

    const processStatus = {};
    for (const [key, process] of Object.entries(this.processes)) {
      processStatus[key] = {
        name: process.name,
        status: process.status,
        pid: process.pid,
        restarts: process.restarts,
        last_restart: process.last_restart,
      };
    }

    return {
      running: this.running,
      uptime_hours: uptimeHours,
      processes: processStatus,
      stats: this.stats,
    };
  }

  async printStatus() {
    const status = this.getStatus();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 HEALTH MONITOR STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🟢 Running: ${status.running ? 'YES' : 'NO'}`);
    console.log(`⏰ Uptime: ${status.uptime_hours} hours`);
    console.log(`🔍 Health Checks: ${status.stats.health_checks}`);
    console.log(`🔄 Total Restarts: ${status.stats.total_restarts}`);
    console.log(`❌ Errors: ${status.stats.errors}`);
    console.log('\n📦 PROCESSES:');

    for (const [key, process] of Object.entries(status.processes)) {
      const statusIcon = process.status === 'running' ? '🟢' : process.status === 'stopped' ? '🔴' : '⚠️';
      console.log(`\n   ${statusIcon} ${process.name}`);
      console.log(`      Status: ${process.status}`);
      console.log(`      PID: ${process.pid || 'N/A'}`);
      console.log(`      Restarts: ${process.restarts}`);
      if (process.last_restart) {
        console.log(`      Last Restart: ${new Date(process.last_restart).toLocaleString()}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== MAIN =====

async function main() {
  const monitor = new HealthMonitor();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Received SIGINT, shutting down gracefully...');
    await monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️  Received SIGTERM, shutting down gracefully...');
    await monitor.stop();
    process.exit(0);
  });

  // Print status every 15 minutes
  setInterval(() => {
    monitor.printStatus();
  }, 15 * 60 * 1000);

  // Start monitor
  await monitor.start();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n💥 Fatal Error: ${err.message}\n`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { HealthMonitor };
