#!/usr/bin/env python3
"""
Digital Product Generator using Gemini AI + FPDF
"""
import os
import json
from datetime import datetime
from fpdf import FPDF
import google.generativeai as genai
from config import config
from utils import log_info, log_error, log_success, sanitize_filename

# Configure Gemini
genai.configure(api_key=config.GEMINI_API_KEY)

class ProductPDF(FPDF):
    """Custom PDF class with header and footer"""

    def header(self):
        """PDF Header"""
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'LinktoFunnel - Digital Product', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        """PDF Footer"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        """Add chapter title"""
        self.set_font('Arial', 'B', 14)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        """Add chapter body text"""
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 6, body)
        self.ln()

def generate_product_content(product_name, product_description):
    """Generate product content using Gemini AI"""
    try:
        log_info(f"Generating content for: {product_name}")

        model = genai.GenerativeModel('gemini-pro')

        prompt = f"""
        Erstelle einen umfassenden digitalen Produkt-Guide für:

        **Produkt:** {product_name}
        **Beschreibung:** {product_description}

        Der Guide soll folgendes enthalten:

        1. **Einleitung** (1-2 Absätze)
           - Was ist das Produkt?
           - Für wen ist es gedacht?

        2. **Hauptinhalt** (5-7 Kapitel, jeweils 2-3 Absätze)
           - Detaillierte Erklärungen
           - Praktische Anleitungen
           - Konkrete Beispiele

        3. **Fazit** (1-2 Absätze)
           - Zusammenfassung
           - Nächste Schritte

        Formatiere die Ausgabe als JSON:
        {{
          "title": "Produktname",
          "chapters": [
            {{
              "title": "Kapitel-Titel",
              "content": "Kapitel-Inhalt..."
            }}
          ]
        }}

        Schreibe auf Deutsch, professionell aber verständlich.
        """

        response = model.generate_content(prompt)
        content_text = response.text

        # Extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', content_text, re.DOTALL)

        if json_match:
            content_json = json.loads(json_match.group())
        else:
            # Fallback: create simple structure
            content_json = {
                "title": product_name,
                "chapters": [
                    {
                        "title": "Einleitung",
                        "content": content_text[:500]
                    },
                    {
                        "title": "Hauptinhalt",
                        "content": content_text[500:]
                    }
                ]
            }

        log_success("Content generated successfully!")
        return content_json

    except Exception as e:
        log_error(f"Failed to generate content: {str(e)}")
        # Return fallback content
        return {
            "title": product_name,
            "chapters": [
                {
                    "title": "Einleitung",
                    "content": f"Willkommen zu {product_name}! {product_description}"
                }
            ]
        }

def create_pdf_product(product_name, product_description):
    """Create PDF product file"""
    try:
        log_info(f"Creating PDF for: {product_name}")

        # Generate content
        content = generate_product_content(product_name, product_description)

        # Create PDF
        pdf = ProductPDF()
        pdf.add_page()

        # Title
        pdf.set_font('Arial', 'B', 20)
        pdf.cell(0, 15, content['title'], 0, 1, 'C')
        pdf.ln(10)

        # Chapters
        for chapter in content['chapters']:
            pdf.chapter_title(chapter['title'])
            pdf.chapter_body(chapter['content'])

        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        safe_name = sanitize_filename(product_name)
        filename = f"{safe_name}_{timestamp}.pdf"
        filepath = os.path.join(config.DIGITAL_PRODUCTS_DIR, filename)

        # Ensure directory exists
        os.makedirs(config.DIGITAL_PRODUCTS_DIR, exist_ok=True)

        # Save PDF
        pdf.output(filepath)

        log_success(f"PDF created: {filename}")

        # Save metadata
        metadata = {
            "product_name": product_name,
            "product_description": product_description,
            "filename": filename,
            "filepath": filepath,
            "created_at": datetime.now().isoformat(),
            "file_size": os.path.getsize(filepath)
        }

        metadata_path = os.path.join(config.DIGITAL_PRODUCTS_DIR, 'product_metadata.json')

        # Load or create metadata file
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                all_metadata = json.load(f)
        else:
            all_metadata = []

        all_metadata.append(metadata)

        with open(metadata_path, 'w') as f:
            json.dump(all_metadata, f, indent=2)

        return {
            'success': True,
            'filename': filename,
            'filepath': filepath,
            'metadata': metadata
        }

    except Exception as e:
        log_error(f"Failed to create PDF: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    # Test product generation
    result = create_pdf_product(
        "AI Automation Blueprint 2025",
        "Der umfassende Guide zur AI-Automatisierung für Kleinunternehmen"
    )
    print(json.dumps(result, indent=2))
