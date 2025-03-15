import { fetchRealTimeCryptoData, fetchRealTimeStockData } from "./market-api";

// Transaction interface
export interface Transaction {
  id: string;
  assetId: string;
  assetName: string;
  assetType: "stock" | "crypto" | "insurance";
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: number;
}

// Portfolio snapshot interface for historical tracking
export interface PortfolioSnapshot {
  date: string; // ISO date string
  totalValue: number;
  stocksValue: number;
  cryptoValue: number;
  insuranceValue: number;
}

// Asset allocation data for pie chart
export interface AssetAllocation {
  stocks: number;
  crypto: number;
  insurance: number;
}

// Asset interface
export interface Asset {
  id: string;
  name: string;
  quantity: number;
  price: number;
  avgBuyPrice: number;
  totalValue: number;
  change?: number;
  profit?: number;
  profitPercentage?: number;
}

// Market data interface
export interface MarketData {
  id: string | number;
  name: string;
  ticker: string;
  price: number;
  change: number;
  marketCap: string;
  volume: string;
  image?: string;
}

// Get all transactions from localStorage
export function getAllTransactions(): Transaction[] {
  try {
    const transactions = localStorage.getItem("transactions");
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error("Error getting transactions:", error);
    return [];
  }
}

// Save a new transaction
export function saveTransaction(transaction: Transaction): void {
  try {
    const transactions = getAllTransactions();
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    
    // Update portfolio snapshot after new transaction
    updatePortfolioSnapshot();
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
}

// Get user portfolio (combined stocks, crypto, insurance)
export function getUserPortfolio(): { stocks: Asset[], crypto: Asset[], insurance: Asset[] } {
  const userStocks = JSON.parse(localStorage.getItem("userStocks") || "[]");
  const userCrypto = JSON.parse(localStorage.getItem("userCrypto") || "[]");
  const userInsurance = JSON.parse(localStorage.getItem("userInsurance") || "[]");
  
  return {
    stocks: userStocks,
    crypto: userCrypto,
    insurance: userInsurance
  };
}

// Calculate total portfolio value
export function calculateTotalPortfolioValue(): { totalValue: number, stocksValue: number, cryptoValue: number, insuranceValue: number } {
  const portfolio = getUserPortfolio();
  
  const stocksValue = portfolio.stocks.reduce((total: number, stock: Asset) => total + (stock.totalValue || 0), 0);
  const cryptoValue = portfolio.crypto.reduce((total: number, crypto: Asset) => total + (crypto.totalValue || 0), 0);
  const insuranceValue = portfolio.insurance.reduce((total: number, insurance: Asset) => total + (insurance.totalValue || 0), 0);
  
  const totalValue = stocksValue + cryptoValue + insuranceValue;
  
  return {
    totalValue,
    stocksValue,
    cryptoValue,
    insuranceValue
  };
}

// Calculate asset allocation percentages
export function calculateAssetAllocation(): AssetAllocation {
  const { totalValue, stocksValue, cryptoValue, insuranceValue } = calculateTotalPortfolioValue();
  
  if (totalValue === 0) {
    return { stocks: 0, crypto: 0, insurance: 0 };
  }
  
  return {
    stocks: Math.round((stocksValue / totalValue) * 100),
    crypto: Math.round((cryptoValue / totalValue) * 100),
    insurance: Math.round((insuranceValue / totalValue) * 100)
  };
}

// Get recent transactions (last 10)
export function getRecentTransactions(limit: number = 10): Transaction[] {
  const transactions = getAllTransactions();
  
  // Sort by timestamp (newest first)
  return transactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

// Update portfolio with real-time prices
export async function updatePortfolioWithRealTimePrices(): Promise<boolean> {
  try {
    // Fetch real-time data
    const cryptoData = await fetchRealTimeCryptoData();
    const stockData = await fetchRealTimeStockData();
    
    // Get current portfolio
    const portfolio = getUserPortfolio();
    
    // Update crypto portfolio
    if (portfolio.crypto.length > 0) {
      const updatedCrypto = portfolio.crypto.map((userCrypto: Asset) => {
        const latestData = cryptoData.find((crypto: MarketData) => crypto.id === userCrypto.id);
        if (latestData) {
          const newTotalValue = userCrypto.quantity * latestData.price;
          const profit = newTotalValue - (userCrypto.avgBuyPrice * userCrypto.quantity);
          const profitPercentage = ((latestData.price / userCrypto.avgBuyPrice) - 1) * 100;
          
          return {
            ...userCrypto,
            price: latestData.price,
            change: latestData.change,
            totalValue: newTotalValue,
            profit,
            profitPercentage
          };
        }
        return userCrypto;
      });
      
      localStorage.setItem("userCrypto", JSON.stringify(updatedCrypto));
    }
    
    // Update stock portfolio
    if (portfolio.stocks.length > 0) {
      const updatedStocks = portfolio.stocks.map((userStock: Asset) => {
        const latestData = stockData.find((stock: MarketData) => stock.id === userStock.id);
        if (latestData) {
          const newTotalValue = userStock.quantity * latestData.price;
          const profit = newTotalValue - (userStock.avgBuyPrice * userStock.quantity);
          const profitPercentage = ((latestData.price / userStock.avgBuyPrice) - 1) * 100;
          
          return {
            ...userStock,
            price: latestData.price,
            change: latestData.change,
            totalValue: newTotalValue,
            profit,
            profitPercentage
          };
        }
        return userStock;
      });
      
      localStorage.setItem("userStocks", JSON.stringify(updatedStocks));
    }
    
    // Update portfolio snapshot
    updatePortfolioSnapshot();
    
    return true;
  } catch (error) {
    console.error("Error updating portfolio with real-time prices:", error);
    return false;
  }
}

// Save portfolio snapshot for historical tracking
export function updatePortfolioSnapshot(): void {
  try {
    const { totalValue, stocksValue, cryptoValue, insuranceValue } = calculateTotalPortfolioValue();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get existing snapshots
    const snapshots: PortfolioSnapshot[] = JSON.parse(localStorage.getItem("portfolioSnapshots") || "[]");
    
    // Check if we already have a snapshot for today
    const todaySnapshotIndex = snapshots.findIndex(snapshot => snapshot.date === today);
    
    const newSnapshot: PortfolioSnapshot = {
      date: today,
      totalValue,
      stocksValue,
      cryptoValue,
      insuranceValue
    };
    
    if (todaySnapshotIndex !== -1) {
      // Update today's snapshot
      snapshots[todaySnapshotIndex] = newSnapshot;
    } else {
      // Add new snapshot
      snapshots.push(newSnapshot);
    }
    
    // Keep only last 365 days
    const recentSnapshots = snapshots
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 365);
    
    localStorage.setItem("portfolioSnapshots", JSON.stringify(recentSnapshots));
  } catch (error) {
    console.error("Error updating portfolio snapshot:", error);
  }
}

// Get portfolio performance data for chart
export function getPortfolioPerformanceData(months: number = 12): { labels: string[], data: number[] } {
  // Get historical snapshots from localStorage
  const snapshots = JSON.parse(localStorage.getItem("portfolioSnapshots") || "[]");
  
  // If no snapshots, return empty data
  if (snapshots.length === 0) {
    const labels = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      return date.toLocaleString('default', { month: 'short' });
    });
    return {
      labels,
      data: Array(months).fill(0)
    };
  }
  
  // Get last N months of data
  const recentSnapshots = snapshots.slice(-months);
  
  return {
    labels: recentSnapshots.map((snapshot: PortfolioSnapshot) => {
      const date = new Date(snapshot.date);
      return date.toLocaleString('default', { month: 'short' });
    }),
    data: recentSnapshots.map((snapshot: PortfolioSnapshot) => snapshot.totalValue)
  };
}

// Calculate monthly change percentage
export function calculateMonthlyChange(): { total: number, stocks: number, crypto: number, insurance: number } {
  const portfolio = getUserPortfolio();
  const currentValues = calculateTotalPortfolioValue();
  
  // Get last month's snapshot from localStorage
  const lastMonthSnapshot = JSON.parse(localStorage.getItem("lastMonthSnapshot") || "null");
  
  if (!lastMonthSnapshot) {
    return {
      total: 0,
      stocks: 0,
      crypto: 0,
      insurance: 0
    };
  }
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  return {
    total: calculateChange(currentValues.totalValue, lastMonthSnapshot.totalValue),
    stocks: calculateChange(currentValues.stocksValue, lastMonthSnapshot.stocksValue),
    crypto: calculateChange(currentValues.cryptoValue, lastMonthSnapshot.cryptoValue),
    insurance: calculateChange(currentValues.insuranceValue, lastMonthSnapshot.insuranceValue)
  };
}

// Initialize portfolio tracker
export function initializePortfolioTracker(): void {
  // Create initial snapshot if none exists
  const snapshots = localStorage.getItem("portfolioSnapshots");
  if (!snapshots) {
    updatePortfolioSnapshot();
  }
  
  // Update portfolio with real-time prices
  updatePortfolioWithRealTimePrices();
}
