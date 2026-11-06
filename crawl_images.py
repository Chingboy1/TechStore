import os
import re
import time
import requests
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# Đường dẫn lưu ảnh (trỏ thẳng vào thư mục public/images của Next.js)
SAVE_DIR = "public/images"

def clean_filename(name):
    """Chuyển tên sản phẩm thành tên file chuẩn (ví dụ: iPhone 15 Pro -> iphone-15-pro)"""
    name = name.lower()
    name = re.sub(r'[^\w\s-]', '', name) # Bỏ ký tự đặc biệt
    name = re.sub(r'[-\s]+', '-', name).strip('-')
    return name

def download_image(img_url, filename):
    """Tải ảnh từ URL về máy"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(img_url, headers=headers, stream=True, timeout=10)
        if response.status_code == 200:
            filepath = os.path.join(SAVE_DIR, f"{filename}.jpg")
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            print(f"✅ Đã tải: {filename}.jpg")
        else:
            print(f"❌ Lỗi tải {filename}: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi tải {filename}: {e}")

def crawl_and_download():
    # Tạo thư mục nếu chưa có
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)

    with sync_playwright() as p:
        print("🚀 Đang khởi động trình duyệt...")
        browser = p.chromium.launch(headless=False) # Đổi thành True nếu muốn ẩn trình duyệt
        page = browser.new_page()
        
        print("🌐 Đang truy cập CellphoneS...")
        page.goto("https://cellphones.com.vn/mobile/apple.html", wait_until="networkidle", timeout=60000)

        # Cuộn trang để kích hoạt Lazy-load
        print("🖱️ Đang cuộn trang để tải toàn bộ sản phẩm...")
        for _ in range(8): # Cuộn 8 lần, mỗi lần 2000px
            page.mouse.wheel(0, 2000)
            time.sleep(1)

        # Lấy toàn bộ HTML sau khi đã tải xong và đưa cho BeautifulSoup
        print("🔍 Đang bóc tách dữ liệu HTML...")
        html_content = page.content()
        soup = BeautifulSoup(html_content, 'html.parser')

        # Tìm tất cả các thẻ sản phẩm (Class này dựa trên cấu trúc hiện tại của CellphoneS)
        products = soup.find_all('div', class_='product-item')

        print(f"Tìm thấy {len(products)} sản phẩm. Bắt đầu lấy ảnh...")

        for index, product in enumerate(products):
            try:
                # Lấy tên sản phẩm
                name_tag = product.find('h3')
                if not name_tag:
                    continue
                product_name = name_tag.text.strip()
                
                # Lấy thẻ ảnh
                img_tag = product.find('img')
                if img_tag:
                    # Ưu tiên lấy ảnh gốc (data-src) để nét hơn ảnh thumbnail (src)
                    img_url = img_tag.get('data-src') or img_tag.get('src')
                    
                    if img_url and img_url.startswith('http'):
                        file_name = clean_filename(product_name)
                        
                        # Tải ảnh
                        download_image(img_url, file_name)
                        
                        # Nghỉ 0.5s để tránh bị server đánh dấu spam
                        time.sleep(0.5) 
            except Exception as e:
                print(f"Lỗi ở sản phẩm thứ {index}: {e}")

        browser.close()
        print("🎉 Đã hoàn thành!")

if __name__ == "__main__":
    crawl_and_download()