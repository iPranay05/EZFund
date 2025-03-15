// Real-time market data API integration
import { cryptoData, stocksData } from './data';

// Function to fetch real-time cryptocurrency data from CoinGecko
export async function fetchRealTimeCryptoData() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    
    const data = await response.json();
    
    return data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      ticker: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change: coin.price_change_percentage_24h,
      marketCap: formatMarketCap(coin.market_cap),
      volume: formatMarketCap(coin.total_volume),
      image: coin.image,
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    // Return mock data as fallback
    return cryptoData;
  }
}

// Function to fetch real-time stock data from Alpha Vantage
export async function fetchRealTimeStockData() {
  try {
    // Note: You'll need to sign up for a free API key at https://www.alphavantage.co/
    // This is using a sample API key - replace with your own
    const API_KEY = 'demo';
    const symbols = ['RELIANCE.BSE', 'HDFCBANK.BSE', 'INFY.BSE', 'TCS.BSE', 'ICICIBANK.BSE'];
    
    // We'll fetch data for each symbol
    const stockPromises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`);
        }
        
        const data = await response.json();
        
        // Check if we have valid data
        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          const quote = data['Global Quote'];
          const price = parseFloat(quote['05. price']);
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
          
          // Find the corresponding stock in our mock data to get the name
          const stockInfo = stocksData.find(stock => stock.ticker === symbol.split('.')[0]);
          
          return {
            id: symbol,
            name: stockInfo?.name || symbol,
            ticker: symbol.split('.')[0],
            price: price,
            change: changePercent,
            marketCap: "N/A", // Alpha Vantage doesn't provide this in the basic quote
            volume: quote['06. volume'] ? formatMarketCap(parseInt(quote['06. volume'])) : "N/A",
          };
        }
        
        // If we don't have valid data, return null
        return null;
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        // Find the corresponding stock in our mock data
        const stockInfo = stocksData.find(stock => stock.ticker === symbol.split('.')[0]);
        return stockInfo ? { ...stockInfo } : null;
      }
    });
    
    const stocksResult = await Promise.all(stockPromises);
    const filteredStocks = stocksResult.filter(stock => stock !== null);
    
    // If we couldn't get any real-time data, return the mock data
    return filteredStocks.length > 0 ? filteredStocks : stocksData;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    // Return mock data as fallback
    return stocksData;
  }
}

// Format large numbers for display
function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return (value / 1e12).toFixed(1) + 'T';
  } else if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  } else {
    return value.toString();
  }
}

// Function to update user portfolio with real-time prices
export function updatePortfolioWithRealTimeData(portfolio: any[], marketData: any[]) {
  return portfolio.map(item => {
    const currentMarketData = marketData.find(market => market.ticker === item.ticker);
    
    if (!currentMarketData) return item;
    
    const newPrice = currentMarketData.price;
    const totalValue = newPrice * item.quantity;
    const profit = totalValue - (item.avgBuyPrice * item.quantity);
    const profitPercentage = (profit / (item.avgBuyPrice * item.quantity)) * 100;
    
    return {
      ...item,
      price: newPrice,
      change: currentMarketData.change,
      totalValue: totalValue,
      profit: profit,
      profitPercentage: profitPercentage,
    };
  });
}
