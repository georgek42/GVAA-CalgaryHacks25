from flask import Flask, request, send_file
import yfinance as yf
import matplotlib.pyplot as plt
from io import BytesIO

app = Flask(__name__)

@app.route('/get_stock_chart', methods=['GET'])
def get_stock_chart():
    ticker = request.args.get('ticker')
    date_range = request.args.get('range', '1mo')  # Default to 1 month
    interval = request.args.get('interval', '1d')  # Default to 1 day

    # Download stock data from Yahoo Finance
    data = yf.download(ticker, period=date_range, interval=interval)
    
    # Plot stock trend (Closing price)
    plt.figure(figsize=(10, 5))
    plt.plot(data['Close'], label='Close Price')
    plt.title(f'{ticker} Stock Price Trend')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()

    # Save the plot to a BytesIO buffer (in-memory file)
    img_buf = BytesIO()
    plt.savefig(img_buf, format='png')
    img_buf.seek(0)  # Go to the beginning of the buffer

    # Send the image file to the frontend
    return send_file(img_buf, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
