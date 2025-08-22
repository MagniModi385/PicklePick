from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime

# ============================================================================
# SETUP AND CONFIGURATION
# ============================================================================

def setup_driver():
    """Initialize Chrome WebDriver with headless mode - no browser window opens"""
    options = webdriver.ChromeOptions()
    
    # HEADLESS MODE - No browser window will open
    options.add_argument('--headless=new')  # Modern headless mode
    
    # Performance and stability options
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-plugins')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-images')  # Don't load images for faster scraping
    
    print("🔧 Running Chrome in headless mode (no browser window)")
    
    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

# ============================================================================
# ENHANCED SLOT EXTRACTION ENGINE
# ============================================================================

def extract_slots(driver, venue_name, court_name):
    """Extract all slot data from the booking table with enhanced availability detection"""
    wait = WebDriverWait(driver, 10)
    slots_data = []
    
    try:
        print(f"🔍 Extracting slots for: {court_name}")
        print("-" * 50)
        time.sleep(2)
        
        slots_table = driver.find_element(By.CLASS_NAME, "style_table__gYUfm")
        
        # Extract available dates from table headers
        date_elements = slots_table.find_elements(By.CLASS_NAME, "style_date__vVFsu")
        dates = [
            elem.text.strip()
            for elem in date_elements
            if elem.text.strip().isdigit() and len(elem.text.strip()) <= 2
        ]
        
        print(f"📅 Available dates: {dates}")
        
        # Get all data rows (excluding header)
        all_rows = slots_table.find_elements(By.XPATH, ".//tr")
        data_rows = all_rows[1:]  # Skip header row
        
        print(f"⏰ Processing {len(data_rows)} time slots...")
        
        # Process each time slot row
        for row_index, row in enumerate(data_rows):
            try:
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) == 0:
                    continue
                
                # Extract time from first cell
                time_slot = cells[0].text.strip()
                
                # Skip invalid time slots
                if not time_slot or ("AM" not in time_slot and "PM" not in time_slot):
                    continue
                
                # Process each date column
                data_cells = cells[1:]  # Skip time column
                for cell_index, cell in enumerate(data_cells):
                    if cell_index < len(dates):
                        cell_text = cell.text.strip()
                        
                        # Get cell styling/classes for availability detection
                        cell_classes = cell.get_attribute('class') or ""
                        cell_style = cell.get_attribute('style') or ""
                        
                        # Skip completely empty cells
                        if not cell_text or cell_text == "-":
                            continue
                        
                        # Enhanced availability detection
                        price, availability, is_available = parse_slot_data_enhanced(
                            cell_text, cell_classes, cell_style
                        )
                        
                        # Only add slots with meaningful data
                        if price or availability:
                            slot_info = {
                                'venue': venue_name,
                                'court': court_name,
                                'date': dates[cell_index],
                                'time': time_slot,
                                'price': price,
                                'availability': availability,
                                'is_available': is_available,
                                'raw_data': cell_text,
                                'cell_classes': cell_classes,
                                'scraped_at': datetime.now().isoformat()
                            }
                            slots_data.append(slot_info)
                            
            except Exception as e:
                print(f"⚠️ Error processing row {row_index}: {e}")
                continue
        
        # Calculate summary statistics
        available_count = sum(1 for slot in slots_data if slot['is_available'])
        unavailable_count = len(slots_data) - available_count
        
        print(f"✅ Successfully extracted {len(slots_data)} total slots")
        print(f"📊 Available: {available_count} | Unavailable: {unavailable_count}")
        print("-" * 50)
        
        return slots_data
        
    except Exception as e:
        print(f"❌ Error extracting slots: {e}")
        return []

def parse_slot_data_enhanced(cell_text, cell_classes, cell_style):
    """Enhanced parsing with CSS class and style detection for better availability detection"""
    price = ""
    availability = ""
    is_available = False
    
    # Check for disabled/grayed out styling first
    disabled_keywords = ['disabled', 'unavailable', 'booked', 'inactive', 'grey', 'gray']
    if any(keyword in cell_classes.lower() for keyword in disabled_keywords):
        availability = "Unavailable (Disabled)"
        is_available = False
        return price, availability, is_available
    
    # Check for grayed out styling in CSS
    if 'opacity' in cell_style.lower():
        opacity_val = cell_style.lower().split('opacity')[1].split(';').replace(':', '').strip()
        try:
            if float(opacity_val) < 0.5:  # Less than 50% opacity = disabled
                availability = "Unavailable (Grayed Out)"
                is_available = False
                return price, availability, is_available
        except:
            pass
    
    # Standard text-based parsing
    if "₹" in cell_text:
        # Extract price
        price_parts = cell_text.split("₹")
        if len(price_parts) > 1:
            price_num = price_parts[1].split() if price_parts[1].split() else ""
            price = f"₹{price_num}"
        
        # Check availability status
        if "left" in cell_text.lower():
            # Extract the number before "left"
            left_part = cell_text.split("₹")[0].strip()
            # Check for "0 left" specifically
            if "0 left" in cell_text.lower():
                availability = "Fully Booked"
                is_available = False
            else:
                availability = left_part
                is_available = True
        else:
            # Has price but no "left" indicator
            availability = "Available"
            is_available = True
            
    elif any(keyword in cell_text.lower() for keyword in ["booked", "unavailable", "closed", "full", "sold out"]):
        # Explicitly unavailable keywords
        availability = "Booked"
        is_available = False
    elif cell_text.strip() == "" or cell_text.strip() == "-" or cell_text.strip() == "N/A":
        # Empty or placeholder cells
        availability = "Not Available"
        is_available = False
    else:
        # Unknown status - be conservative
        availability = f"Unknown ({cell_text})"
        is_available = False
    
    return price, availability, is_available

# ============================================================================
# MAIN SCRAPING FUNCTION FOR API
# ============================================================================

def scrape_venue_slots(venue_url, venue_name):
    """Scrape slots for all courts in a venue - headless mode"""
    print(f"🚀 Starting headless scraper for: {venue_name}")
    
    driver = setup_driver()
    wait = WebDriverWait(driver, 10)
    all_courts_data = []
    
    try:
        print(f"🌐 Navigating to venue: {venue_name}")
        driver.get(venue_url)
        time.sleep(2)
        
        # Step 1: Click main activity button
        print("🎯 Looking for main activity button...")
        activity_button = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(@class, 'style_btnBook__vzqXl') and normalize-space(text())='Book']")
            )
        )
        activity_button.click()
        time.sleep(2)
        print("✅ Activity button clicked")
        
        # Step 2: Find available courts
        print("🏟️ Searching for available courts...")
        court_buttons = wait.until(EC.presence_of_all_elements_located(
            (By.XPATH, "//button[contains(@class, 'style_btnBook__M3MFK') and normalize-space(text())='Book']")
        ))
        
        print(f"✅ Found {len(court_buttons)} available courts")
        
        # Step 3: Process each court (limit to first 3 for performance)
        for i, court_button in enumerate(court_buttons[:3]):
            try:
                # Extract court name
                try:
                    court_container = court_button.find_element(By.XPATH, "./ancestor::div[contains(@class, 'court-card')]")
                    court_name = court_container.find_element(By.TAG_NAME, "h3").text.strip()
                except:
                    court_name = f"Court {i+1}"
                
                print(f"🏆 Processing court: {court_name}")
                court_button.click()
                time.sleep(3)
                
                # Extract slot data for this court
                slots = extract_slots(driver, venue_name, court_name)
                
                court_data = {
                    'court_name': court_name,
                    'total_slots': len(slots),
                    'available_slots': sum(1 for slot in slots if slot['is_available']),
                    'slots': slots,
                    'scraped_at': datetime.now().isoformat()
                }
                
                all_courts_data.append(court_data)
                
                # Go back to court selection
                driver.back()
                time.sleep(2)
                
            except Exception as e:
                print(f"❌ Error processing court {i+1}: {e}")
                continue
        
        # Final result
        result = {
            'venue_name': venue_name,
            'venue_url': venue_url,
            'total_courts': len(all_courts_data),
            'courts': all_courts_data,
            'scraped_at': datetime.now().isoformat(),
            'status': 'success'
        }
        
        print(f"🎉 Headless scraping completed successfully!")
        print(f"📊 Processed {len(all_courts_data)} courts")
        
        return result
        
    except Exception as e:
        print(f"❌ Error scraping venue: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'venue_name': venue_name,
            'venue_url': venue_url
        }
    finally:
        driver.quit()
        print("🏁 Browser closed - Headless scraping finished!")

# ============================================================================
# TEST FUNCTION
# ============================================================================

if __name__ == "__main__":
    # Test the headless scraper
    TEST_URL = "https://hudle.in/venues/vinayak-sports-arena-thaltej/750492"
    VENUE_NAME = "Hot Shot Pickleball Arena"
    
    print("🚀 Testing headless scraper...")
    result = scrape_venue_slots(TEST_URL, VENUE_NAME)
    print("\n📋 Final Result:")
    print(json.dumps(result, indent=2))
