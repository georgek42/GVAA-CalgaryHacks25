from flask import Flask, request, jsonify, send_from_directory
import yfinance as yf
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

# Directory to store images
IMAGE_DIR = "static/images"
os.makedirs(IMAGE_DIR, exist_ok=True)  # Ensure directory exists

@app.route('/get_stock_chart', methods=['GET'])
def get_stock_chart():
    ticker = request.args.get('ticker', 'AAPL')  # Default ticker
    date_range = request.args.get('range', '1mo')  # Default range
    interval = request.args.get('interval', '1d')  # Default interval

    # Download stock data
    data = yf.download(ticker, period=date_range, interval=interval)

    # Check if data is empty (invalid ticker or no data)
    if data.empty:
        return jsonify({"error": "No data available for this stock ticker and range."}), 400

    # Create and save the stock chart
    plt.figure(figsize=(10, 5))
    plt.plot(data['Close'], label='Close Price', color='blue')
    plt.title(f'{ticker} Stock Price Trend')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()

    # Save the image
    filename = f"{ticker}_{date_range}_{interval}.png"
    filepath = os.path.join(IMAGE_DIR, filename)
    plt.savefig(filepath)
    plt.close()  # Clear plot to free memory

    # Return filename (frontend will fetch this image separately)
    filepath = "test123.png"
    plt.savefig(filepath)
    plt.close()  # Clear plot to free memory
    return jsonify({"filename": "test123.png"})

# Endpoint to serve saved images
@app.route('/static/images/<filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)
