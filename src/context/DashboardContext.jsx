import React, { createContext, useContext, useState, useCallback } from 'react';
import { getFinancialTruth } from '../services/edgarSpine';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
    const [selectedTicker, setSelectedTicker] = useState('NVDA');
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStock = useCallback(async (ticker) => {
        if (!ticker || ticker.length < 2) return;

        setSelectedTicker(ticker.toUpperCase());
        setLoading(true);
        setError(null);

        try {
            // getFinancialTruth now handles its own caching
            const data = await getFinancialTruth(ticker.toUpperCase());
            setStockData(data);
        } catch (e) {
            console.error('Failed to fetch stock data:', e);
            setError(e.message || 'Could not fetch SEC data');
            setStockData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch initial ticker on mount
    React.useEffect(() => {
        fetchStock(selectedTicker);
    }, []);

    const value = {
        selectedTicker,
        stockData,
        loading,
        error,
        fetchStock,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
