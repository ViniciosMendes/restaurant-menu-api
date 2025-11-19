CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    kitchen_type VARCHAR(50) NOT NULL,
    city VARCHAR(30) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    contact VARCHAR(11) NOT NULL,
    isActive boolean DEFAULT true,
    createdAt TIMESTAMP NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE restaurant_openings_hours (
    restaurant_id INTEGER,
    day_of_week VARCHAR(10),
    opensAt TIME NOT NULL,
    closesAt TIME NOT NULL,
    PRIMARY KEY (restaurant_id, day_of_week),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    restaurant_id INTEGER,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(200) NOT NULL,
    isActive boolean DEFAULT true,
    createdAt TIMESTAMP NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP NOT NULL DEFAULT now(),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(200) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    isActive boolean DEFAULT true,
    createdAt TIMESTAMP NOT NULL DEFAULT now(),
    updatedAt TIMESTAMP NOT NULL DEFAULT now(),
    FOREIGN KEY (section_id)
        REFERENCES sections(section_id)
);
