import requests
from bs4 import BeautifulSoup

# URL of the website you want to scrape
url = 'https://millionlordscalc.com/'  # Replace with the actual URL

# Function to scrape the towersize_output for a given city_end_val
def scrape_towersize_output(city_end_val):
    # Send a GET request to the website with the city_start_val and city_end_val parameters
    response = requests.get(f"{url}?city_start_val=1&city_end_val={city_end_val}")

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the span element with id="towersize_output"
        towersize_output = soup.find('span', {'id': 'towersize_output'})

        # Check if the element was found
        if towersize_output:
            # Extract the text content of the span element
            towersize_value = towersize_output.text.strip()
            return towersize_value
        else:
            print(f"Towersize output not found on the page for city_end_val {city_end_val}.")
            return None
    else:
        print(f"Failed to retrieve the page for city_end_val {city_end_val}. Status code: {response.status_code}")
        return None

# Iterate through each city_end_val from 1 to 140
for city_end_val in range(1, 141):
    towersize_value = scrape_towersize_output(city_end_val)
    if towersize_value:
        print(f"City End Level: {city_end_val}")
        print(f"Towersize: {towersize_value}")
        print("-" * 40)