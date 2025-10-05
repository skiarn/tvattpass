import React, { useEffect, useState } from 'react';
import WashingLoader from './WashingLoader';
//import './PublicSpreadsheetReader.css';

const PublicSpreadsheetReader: React.FC = () => {
  const [data, setData] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      // Replace this URL with your published spreadsheet CSV URL
      const publishedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-YOUR-PUBLISHED-URL/pub?output=csv';
      
      try {
        const response = await fetch(publishedUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        // Parse CSV
        const rows = csvText.split('\n').map(row => 
          row.split(',').map(cell => 
            cell.replace(/^"(.*)"$/, '$1') // Remove quotes if present
          )
        );
        
        setData(rows);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          console.error(err);
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpreadsheetData();
  }, []);

  if (isLoading) {
    return <WashingLoader />;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  return (
    <div className="spreadsheet-container">
      <h1>Tvättpass Schema</h1>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {data[0]?.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicSpreadsheetReader;