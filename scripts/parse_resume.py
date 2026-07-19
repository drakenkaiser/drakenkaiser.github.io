#!/usr/bin/env python3
"""Parse the resume PDF into data.js for the portfolio site.

Tuned to the layout of "Jofin F Archbald - Master.pdf":
  header block, then ALL-CAPS section headings (WORK EXPERIENCE, TECHNICAL
  SKILLS, EDUCATION, CERTIFICATIONS, AWARDS & RECOGNITION, PROJECTS).
Keep those headings and the bullet style when editing the resume and the
weekly sync will keep working.

Usage: python3 scripts/parse_resume.py <resume.pdf> <output data.js>
"""
import json
import re
import sys
from datetime import date

from pypdf import PdfReader

SECTION_HEADINGS = {
    "WORK EXPERIENCE": "experience",
    "TECHNICAL SKILLS": "skills",
    "EDUCATION": "education",
    "CERTIFICATIONS": "certifications",
    "AWARDS & RECOGNITION": "awards",
    "PROJECTS": "projects",
}

DATE_RANGE = re.compile(r"([A-Z][a-z]{2} \d{4})\s*[-–]\s*([A-Z][a-z]{2} \d{4}|Present)")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
PHONE = re.compile(r"\+?[\d][\d ()-]{7,}")
LINKEDIN = re.compile(r"linkedin\.com/[^\s•]+")


def clean(text):
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("( ", "(").replace(" )", ")")
    return text


def extract_lines(pdf_path):
    reader = PdfReader(pdf_path)
    lines = []
    for page in reader.pages:
        for raw in (page.extract_text() or "").splitlines():
            if raw.strip():
                lines.append(raw.strip())
    return lines


def split_sections(lines):
    """Return (header_lines, {section_key: [lines]})."""
    sections, current_key, header = {}, None, []
    for line in lines:
        key = SECTION_HEADINGS.get(clean(line).upper())
        if key:
            current_key = key
            sections[key] = []
        elif current_key:
            sections[current_key].append(line)
        else:
            header.append(line)
    return header, sections


def parse_header(header):
    name = clean(header[0]) if header else ""
    contact = {"email": "", "phone": "", "linkedin": ""}
    tagline = ""
    summary_lines = []
    for line in header[1:]:
        text = clean(line)
        if EMAIL.search(text) or LINKEDIN.search(text):
            if m := EMAIL.search(text):
                contact["email"] = m.group()
            if m := PHONE.search(text):
                contact["phone"] = m.group().strip()
            if m := LINKEDIN.search(text):
                contact["linkedin"] = "https://" + m.group().rstrip("/•")
        elif "|" in text and not tagline:
            tagline = text
        else:
            summary_lines.append(text)
    return name, tagline, " ".join(summary_lines), contact


def parse_experience(lines):
    companies = []
    for line in lines:
        text = clean(line)
        if text.startswith("• "):  # bullet
            if companies and companies[-1]["roles"]:
                companies[-1]["roles"][-1]["bullets"].append(text[2:].strip())
        elif m := DATE_RANGE.search(text):  # role line
            title = clean(text.split("•")[0])
            period = f"{m.group(1)} – {m.group(2)}"
            if companies:
                companies[-1]["roles"].append(
                    {"title": title, "period": period, "bullets": []}
                )
        elif "•" in text:  # company line
            company, _, location = text.partition("•")
            companies.append(
                {"company": clean(company), "location": clean(location), "roles": []}
            )
        else:  # wrapped continuation of the previous bullet
            if companies and companies[-1]["roles"] and companies[-1]["roles"][-1]["bullets"]:
                companies[-1]["roles"][-1]["bullets"][-1] += " " + text
    return companies


def parse_skills(lines):
    groups = []
    for line in lines:
        text = clean(line).lstrip("• ")
        if ":" in text:
            category, _, items = text.partition(":")
            groups.append(
                {
                    "category": clean(category),
                    "items": [clean(i) for i in items.split(",") if clean(i)],
                }
            )
        elif groups:  # wrapped item list
            groups[-1]["items"].extend(clean(i) for i in text.split(",") if clean(i))
    return groups


def parse_education(lines):
    entries = []
    for line in lines:
        text = clean(line)
        if "•" in text:
            parts = [clean(p) for p in text.split("•")]
            entries.append(
                {
                    "institution": parts[0],
                    "degree": parts[1] if len(parts) > 1 else "",
                    "detail": " • ".join(parts[2:]) if len(parts) > 2 else "",
                }
            )
        elif entries:
            entries[-1]["detail"] = clean(entries[-1]["detail"] + " " + text)
    return entries


def parse_titled_blocks(lines):
    """Awards / projects: a shortish title line followed by description lines."""
    entries = []
    for line in lines:
        text = clean(line)
        is_title = len(text) < 60 and not text.endswith(".")
        if is_title or not entries:
            entries.append({"title": text, "description": ""})
        else:
            entries[-1]["description"] = clean(entries[-1]["description"] + " " + text)
    return entries


def main(pdf_path, out_path):
    lines = extract_lines(pdf_path)
    header, sections = split_sections(lines)
    name, tagline, summary, contact = parse_header(header)
    data = {
        "name": name,
        "tagline": tagline,
        "summary": summary,
        "contact": contact,
        "experience": parse_experience(sections.get("experience", [])),
        "skills": parse_skills(sections.get("skills", [])),
        "education": parse_education(sections.get("education", [])),
        "certifications": [clean(l) for l in sections.get("certifications", [])],
        "awards": parse_titled_blocks(sections.get("awards", [])),
        "projects": parse_titled_blocks(sections.get("projects", [])),
        "updated": date.today().isoformat(),
    }
    with open(out_path, "w") as f:
        f.write("window.RESUME_DATA = ")
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write(";\n")
    print(f"Wrote {out_path}: {len(data['experience'])} employers, "
          f"{len(data['skills'])} skill groups, {len(data['projects'])} projects")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
