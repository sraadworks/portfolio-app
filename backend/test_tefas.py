from tefas import Crawler
import datetime

def test_tefas_api():
    try:
        crawler = Crawler()
        today = datetime.date.today().isoformat()
        yesterday = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
        
        data = crawler.fetch(start=yesterday, end=today, name="TLY", columns=["date", "price"])
        if not data.empty:
            print("TLY Price:", data.iloc[-1]['price'])
        else:
            print("No data found for TLY")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_tefas_api()
