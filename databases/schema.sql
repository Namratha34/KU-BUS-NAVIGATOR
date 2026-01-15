CREATE TABLE bus_locations (
    bus_number INT PRIMARY KEY,
    current_location VARCHAR(255),
    latitude DOUBLE,
    longitude DOUBLE,
    last_updated DATETIME
);
