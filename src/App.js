import React, { useState, useEffect, useCallback } from 'react';
import { ChakraProvider, Box, Heading, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Flex, Icon, Spinner, SliderMark } from '@chakra-ui/react';
import { FaTemperatureHigh, FaCloudRain, FaCloud } from 'react-icons/fa';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch weather data from Open-Meteo API
  const fetchWeatherData = useCallback(async (hour) => {
    const latitude = 35.6895; // Example latitude for Tokyo
    const longitude = 139.6917; // Example longitude for Tokyo
    const startDate = new Date('2024-07-01T00:00:00Z');
    const endDate = new Date('2024-07-02T00:00:00Z');
    const formatDate = (date) => date.toISOString().split('T')[0];

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&hourly=temperature_2m,precipitation,cloud_cover`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.hourly) {
        throw new Error('Hourly data not found in the API response');
      }

      const hourlyData = data.hourly;
      const weatherInfo = {
        time: new Date(hourlyData.time[hour]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: hourlyData.temperature_2m[hour],
        precipitation: hourlyData.precipitation[hour],
        cloudCover: hourlyData.cloud_cover[hour],
      };
      return weatherInfo;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again later.');
      return null;
    }
  }, []);

  const handleSliderChange = useCallback(async (value) => {
    setLoading(true);
    setError(null);
    const data = await fetchWeatherData(value);
    setWeatherData(data);
    setLoading(false);
  }, [fetchWeatherData, setWeatherData]);

  useEffect(() => {
    handleSliderChange(0); // Fetch initial data for the first hour of July 1, 2024
  }, [handleSliderChange]);

  return (
    <ChakraProvider>
      <Box className="App" p={4}>
        <header className="App-header">
          <Heading as="h1" size="2xl" mb={6}>
            Weather Information
          </Heading>
          <Text fontSize="lg" mb={6}>Use the slider to view weather data for July 1, 2024. Selected time: {weatherData ? weatherData.time : '00:00'}</Text>
          <Slider
            aria-label="weather-slider"
            defaultValue={0}
            min={0}
            max={23}
            step={1}
            onChange={handleSliderChange}
            mb={6}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            {Array.from({ length: 24 }, (_, i) => (
              <SliderMark key={i} value={i} mt="2" ml="-2.5" fontSize="sm">
                {i}:00
              </SliderMark>
            ))}
            <SliderThumb />
          </Slider>
          {loading && (
            <Box mt={4}>
              <Spinner size="xl" />
            </Box>
          )}
          {error && (
            <Box mt={4} color="red.500">
              <Text>{error}</Text>
            </Box>
          )}
          {weatherData && !error && (
            <Flex mt={6} justify="space-around">
              <Box textAlign="center">
                <Text fontSize="xl" mb={2}>Time: {weatherData.time}</Text>
                <Icon as={FaTemperatureHigh} w={8} h={8} mb={2} />
                <Text fontSize="xl">Temperature: {weatherData.temperature}°C</Text>
              </Box>
              <Box textAlign="center">
                <Icon as={FaCloudRain} w={8} h={8} mb={2} />
                <Text fontSize="xl">Precipitation: {weatherData.precipitation} mm</Text>
              </Box>
              <Box textAlign="center">
                <Icon as={FaCloud} w={8} h={8} mb={2} />
                <Text fontSize="xl">Cloud Cover: {weatherData.cloudCover} %</Text>
              </Box>
            </Flex>
          )}
        </header>
      </Box>
    </ChakraProvider>
  );
}

export default App;
