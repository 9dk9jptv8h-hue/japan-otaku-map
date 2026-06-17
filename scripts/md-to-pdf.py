from pathlib import Path
import markdown

from playwright.sync_api import sync_playwright

# 路径
PROJECT_DIR = Path(r'D:\桌面\claude\map-project')
MD_FILE = PROJECT_DIR / 'docs' / 'business-plan.md'
PDF_FILE = PROJECT_DIR / 'docs' / '商业计划书.pdf'
TEMP_HTML = PROJECT_DIR / 'docs' / '_temp_bp.html'

# 2. 读取并转换MD→HTML
md_content = MD_FILE.read_text(encoding='utf-8')
html_body = markdown.markdown(md_content, extensions=['tables', 'fenced_code', 'toc'])

# 3. 包装为完整HTML + 专业CSS
html_full = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
@page {{
  size: A4;
  margin: 1.5cm 1.8cm;
}}
body {{
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  font-size: 10.5pt;
  line-height: 1.6;
  color: #1a1a2e;
  max-width: 100%;
}}
h1 {{
  font-size: 20pt;
  font-weight: 800;
  margin-top: 20px;
  margin-bottom: 8px;
  color: #0a0a12;
  border-bottom: 2px solid #e91e63;
  padding-bottom: 8px;
}}
h2 {{
  font-size: 14pt;
  font-weight: 700;
  margin-top: 18px;
  margin-bottom: 6px;
  color: #1a1a2e;
  page-break-after: avoid;
}}
h3 {{
  font-size: 12pt;
  font-weight: 600;
  margin-top: 14px;
  margin-bottom: 4px;
  color: #333;
  page-break-after: avoid;
}}
h4 {{
  font-size: 11pt;
  font-weight: 600;
  margin-top: 15px;
  color: #444;
  page-break-after: avoid;
}}
p {{
  margin-bottom: 6px;
  orphans: 3;
  widows: 3;
}}
table {{
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 9.5pt;
  page-break-inside: avoid;
}}
th {{
  background: #f0edf4;
  font-weight: 600;
  text-align: left;
  padding: 5px 8px;
  border: 1px solid #ddd;
}}
td {{
  padding: 4px 8px;
  border: 1px solid #ddd;
  vertical-align: top;
}}
tr:nth-child(even) {{
  background: #f9f9fc;
}}
blockquote {{
  border-left: 3px solid #e91e63;
  padding: 8px 16px;
  margin: 12px 0;
  background: #fce4ec08;
  color: #555;
  font-style: italic;
}}
code {{
  background: #f0edf4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 9.5pt;
  font-family: 'Consolas', monospace;
}}
pre {{
  background: #1a1a2e;
  color: #e0e0e8;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 9pt;
  overflow-x: auto;
  page-break-inside: avoid;
}}
pre code {{
  background: transparent;
  color: inherit;
  padding: 0;
}}
ul, ol {{
  margin-bottom: 6px;
  padding-left: 24px;
}}
li {{
  margin-bottom: 2px;
}}
hr {{
  border: none;
  border-top: 1px solid #e0e0e8;
  margin: 16px 0;
}}
strong {{
  color: #e91e63;
}}
/* 封面样式 */
h1:first-of-type {{
  text-align: center;
  font-size: 28pt;
  border: none;
  margin-top: 60px;
  margin-bottom: 30px;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

# 4. 保存临时HTML
TEMP_HTML.write_text(html_full, encoding='utf-8')

# 5. 用Playwright导出PDF
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(f'file:///{TEMP_HTML.as_posix()}')
    page.wait_for_timeout(2000)
    page.pdf(
        path=str(PDF_FILE),
        format='A4',
        margin={
            'top': '1.5cm',
            'bottom': '1.5cm',
            'left': '1.8cm',
            'right': '1.8cm',
        },
        print_background=True,
    )
    browser.close()

# 6. 清理临时文件
TEMP_HTML.unlink()

print(f'PDF已生成: {PDF_FILE}')
print(f'文件大小: {PDF_FILE.stat().st_size / 1024:.0f} KB')
