-- Создание базы данных
create DATABASE istok;
USE istok;

-- Отключение проверки внешних ключей временно
SET FOREIGN_KEY_CHECKS = 0;

-- Удаление существующих таблиц (в правильном порядке)
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS repair;
DROP TABLE IF EXISTS device_error;
DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS statistic;
DROP TABLE IF EXISTS xray;
DROP TABLE IF EXISTS programmers;
DROP TABLE IF EXISTS psi_tests;
DROP TABLE IF EXISTS electricians;
DROP TABLE IF EXISTS assemblers;
DROP TABLE IF EXISTS macs;
DROP TABLE IF EXISTS serial_num_pki;
DROP TABLE IF EXISTS serial_num_bp;
DROP TABLE IF EXISTS serial_num_case;
DROP TABLE IF EXISTS serial_num_package;
DROP TABLE IF EXISTS serial_num_router;
DROP TABLE IF EXISTS serial_num_pcb;
DROP TABLE IF EXISTS serial_num_board;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS iso;
DROP TABLE IF EXISTS uboot;
DROP TABLE IF EXISTS bmc;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS production_stage;
DROP TABLE IF EXISTS production_year;
DROP TABLE IF EXISTS production_month;
DROP TABLE IF EXISTS place_of_production;
DROP TABLE IF EXISTS device_type;

-- Создание таблиц
CREATE TABLE device_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE place_of_production (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE production_month (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE production_year (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE production_stage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    position VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE location (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE bmc (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_bmc VARCHAR(255),
    version_bmc VARCHAR(255)
);

CREATE TABLE uboot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_uboot VARCHAR(255),
    version_uboot VARCHAR(255)
);

CREATE TABLE iso (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_iso VARCHAR(255),
    version_iso VARCHAR(255)
);

CREATE TABLE serial_num_board (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    error_code VARCHAR(255),
    serial_num_board VARCHAR(255),
    visual_inspection BOOLEAN,
    visual_inspection_author VARCHAR(255),
    visual_inspection_datetime VARCHAR(255)
);

CREATE TABLE serial_num_pcb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_pcb VARCHAR(255)
);

CREATE TABLE serial_num_router (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_router VARCHAR(255)
);

CREATE TABLE serial_num_pki (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_pki VARCHAR(255)
);

CREATE TABLE serial_num_bp (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_bp VARCHAR(255)
);

CREATE TABLE serial_num_package (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_package VARCHAR(255)
);

CREATE TABLE serial_num_case (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_case VARCHAR(255)
);

CREATE TABLE macs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    mac_address VARCHAR(17) NOT NULL UNIQUE,
    interface_name VARCHAR(50),
    assignment_date DATE
);

CREATE TABLE devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_type_id BIGINT NOT NULL,
    place_of_production_id BIGINT,
    production_month_id BIGINT,
    production_year_id BIGINT,
    production_stage_id BIGINT,
    actual_location_id BIGINT,
    bmc_id BIGINT,
    uboot_id BIGINT,
    iso_id BIGINT,
    eth1addr_id BIGINT,
    eth2addr_id BIGINT,
    ethaddr_id BIGINT,
    serial_num_board_id BIGINT UNIQUE,
    serial_num_bp_id BIGINT UNIQUE,
    serial_num_case_id BIGINT UNIQUE,
    serial_num_package_id BIGINT UNIQUE,
    serial_num_pcb_id BIGINT UNIQUE,
    serial_num_pki_id BIGINT UNIQUE,
    serial_num_router_id BIGINT UNIQUE,
    date_time_package VARCHAR(255),
    date_time_pci VARCHAR(255),
    diag BOOLEAN,
    manufactures_date VARCHAR(255),
    type VARCHAR(255),
    version_os VARCHAR(255),
    product_serial_number VARCHAR(100) UNIQUE,
    monthly_sequence VARCHAR(10),
    FOREIGN KEY (device_type_id) REFERENCES device_type(id),
    FOREIGN KEY (place_of_production_id) REFERENCES place_of_production(id),
    FOREIGN KEY (production_month_id) REFERENCES production_month(id),
    FOREIGN KEY (production_year_id) REFERENCES production_year(id),
    FOREIGN KEY (production_stage_id) REFERENCES production_stage(id),
    FOREIGN KEY (actual_location_id) REFERENCES location(id),
    FOREIGN KEY (bmc_id) REFERENCES bmc(id),
    FOREIGN KEY (uboot_id) REFERENCES uboot(id),
    FOREIGN KEY (iso_id) REFERENCES iso(id)
);

CREATE TABLE assemblers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,
    assembly_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE electricians (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,
    diagnosis_date DATE NOT NULL,
    diagnosis_result VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE psi_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,
    test_date DATE NOT NULL,
    test_result VARCHAR(255),
    protocol_number VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE programmers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    ip VARCHAR(255),
    place VARCHAR(255),
    serial_number VARCHAR(255),
    stand VARCHAR(255),
    type VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE xray (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    file VARCHAR(255),
    serial_num VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE statistic (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    date_time TIMESTAMP NULL,
    device_type VARCHAR(255),
    manufacturer VARCHAR(255),
    modification_type VARCHAR(255),
    serial_number VARCHAR(255),
    stand VARCHAR(255),
    status BOOLEAN,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    commentary VARCHAR(255),
    date_time VARCHAR(255),
    device_serial_num VARCHAR(255),
    file VARCHAR(255),
    message VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE device_error (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    date VARCHAR(255),
    debug_info VARCHAR(255),
    error_code VARCHAR(255),
    ip VARCHAR(255),
    serial_num VARCHAR(255),
    stand VARCHAR(255),
    status BOOLEAN,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE repair (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    date_time VARCHAR(255),
    date_time_repair VARCHAR(255),
    device_serial_num VARCHAR(255),
    message VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    employee_id BIGINT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Включение проверки внешних ключей
SET FOREIGN_KEY_CHECKS = 1;

-- Вставка данных в справочные таблицы
INSERT INTO device_type (name, code) VALUES
('Сервисный маршрутизатор', 'RS'),
('Граничный маршрутизатор', 'RB'),
('Коммутатор доступа', 'SA'),
('Коммутатор агрегации', 'SG'),
('Коммутатор ЦОД', 'SC'),
('Блейд сервер', 'SB'),
('Стоечный сервер', 'SR'),
('Модуль расширения', 'EX'),
('Сетевая платформа', 'RP'),
('Рециркулятор воздуха', 'AR'),
('Составная часть', 'MC');

INSERT INTO production_month (code, name) VALUES
('1', 'Январь'), ('2', 'Февраль'), ('3', 'Март'), ('4', 'Апрель'), 
('5', 'Май'), ('6', 'Июнь'), ('7', 'Июль'), ('8', 'Август'), 
('9', 'Сентябрь'), ('10', 'Октябрь'), ('11', 'Ноябрь'), ('12', 'Декабрь');

INSERT INTO production_year (code, name) VALUES
('1', '2002'), ('2', '2003'), ('3', '2004'), ('4', '2005'), ('5', '2006'),
('6', '2007'), ('7', '2008'), ('8', '2009'), ('9', '2010'), ('10', '2011'),
('11', '2012'), ('12', '2013'), ('13', '2014'), ('14', '2015'), ('15', '2016'),
('16', '2017'), ('17', '2018'), ('18', '2019'), ('19', '2020'), ('20', '2021'),
('21', '2022'), ('22', '2023'), ('23', '2024'), ('24', '2025'), ('25', '2026');

INSERT INTO production_stage (code, name, description) VALUES
('1', 'Опытный образец', 'опытный образец'),
('2', 'Опытный образец', 'опытный образец'),
('3', 'testing', 'отладочная партия'),
('4', 'testing', 'отладочная партия'),
('5', 'production', 'серийное производство');

INSERT INTO place_of_production (code, name) VALUES
('00', 'неопределено'), 
('01', 'АО НПП Исток'), 
('02', 'ООО EMC-Эксперт'), 
('10', 'АО НПП Исток ПТК-7'), 
('12', 'АО НПП Исток НТК-6'), 
('13', 'АО НПП Исток ПТК-7'), 
('14', 'АО НПП Исток НТД-6'), 
('16', 'АО НПП Исток ПТК-6'),
('17', 'АО НПП Исток Цех №5'),
('18', 'АО НПП Исток Цех №7'),
('19', 'АО НПП Исток Цех №8'),
('20', 'АО НПП Исток Цех №9'),
('21', 'АО НПП Исток Цех №10'),
('22', 'АО НПП Исток Цех №11');

INSERT INTO location (name) VALUES
('Склад готовой продукции'), 
('Цех сборки №1'), 
('Цех диагностики'), 
('Лаборатория ПСИ'), 
('Упаковочный цех'),
('Цех программирования №2'),
('Цех программирования №3'),
('Цех программирования №4'),
('Склад комплектующих'),
('Технический отдел'),
('Ремонтная зона'),
('Цех программирования №1'),
('Цех сборки №2');

INSERT INTO bmc (file_bmc, version_bmc) VALUES
('bmc_v1.2.bin', '1.2'), 
('bmc_v1.3.bin', '1.3'), 
('bmc_v1.4.bin', '1.4'),
('bmc_v1.5.bin', '1.5'), 
('bmc_v2.0.bin', '2.0'),
('bmc_switch_v1.0.bin', '1.0'),
('bmc_switch_v1.1.bin', '1.1'),
('bmc_switch_v2.0.bin', '2.0'),
('bmc_switch_v2.1.bin', '2.1'),
('bmc_router_v3.0.bin', '3.0'),
('bmc_router_v3.1.bin', '3.1'),
('bmc_router_v3.2.bin', '3.2'),
('bmc_router_v4.0.bin', '4.0');

INSERT INTO uboot (file_uboot, version_uboot) VALUES
('uboot_v2022.01', '2022.01'), 
('uboot_v2022.04', '2022.04'), 
('uboot_v2023.01', '2023.01'), 
('uboot_v2023.04', '2023.04'),
('uboot_switch_v2023.01', '2023.01'),
('uboot_switch_v2023.06', '2023.06'),
('uboot_switch_v2024.01', '2024.01'),
('uboot_router_v2023.01', '2023.01'),
('uboot_router_v2024.01', '2024.01'),
('uboot_router_v2024.06', '2024.06'),
('uboot_router_v2025.01', '2025.01');

INSERT INTO iso (file_iso, version_iso) VALUES
('routeros_6.0.iso', '6.0'), 
('routeros_6.1.iso', '6.1'), 
('routeros_6.2.iso', '6.2'), 
('routeros_6.3.iso', '6.3'), 
('routeros_6.4.iso', '6.4'),
('switch_os_3.0.iso', '3.0'),
('switch_os_3.1.iso', '3.1'),
('switch_os_3.2.iso', '3.2'),
('switch_os_4.0.iso', '4.0'),
('routeros_7.0.iso', '7.0'),
('routeros_7.1.iso', '7.1'),
('routeros_7.2.iso', '7.2'),
('routeros_7.3.iso', '7.3'),
('switch_os_5.0.iso', '5.0');

INSERT INTO employees (last_name, first_name, middle_name, position, username, password, role) VALUES
-- Основные сотрудники (1-5)
('Иванов', 'Алексей', 'Петрович', 'Сборщик', 'ivanov_a', '123', 'user'),
('Петров', 'Сергей', 'Иванович', 'Сборщик', 'petrov_s', '123', 'user'),
('Сидоров', 'Дмитрий', 'Васильевич', 'Электрик', 'sidorov_d', '123', 'user'),
('Кузнецов', 'Михаил', 'Александрович', 'Электрик', 'kuznetsov_m', '123', 'user'),
('Смирнова', 'Ольга', 'Викторовна', 'Инженер ПСИ', 'smirnova_o', '123', 'user'),
-- Администраторы (6-8)
('Администратор', 'Главный', 'Системович', 'Главный администратор', 'admin', 'admin123', 'admin'),
('Иванов', 'Иван', 'Иванович', 'Инженер', 'ivanov_i', '123', 'user'),
('Петров', 'Петр', 'Петрович', 'Техник', 'petrov_p', '123', 'user'),
-- Сотрудники для коммутаторов (9-13)
('Соколов', 'Андрей', 'Викторович', 'Сборщик коммутаторов', 'sokolov_a', '123', 'user'),
('Михайлов', 'Денис', 'Сергеевич', 'Сборщик коммутаторов', 'mikhailov_d', '123', 'user'),
('Новикова', 'Елена', 'Александровна', 'Электрик', 'novikova_e', '123', 'user'),
('Морозов', 'Павел', 'Игоревич', 'Инженер ПСИ', 'morozov_p', '123', 'user'),
('Волков', 'Николай', 'Петрович', 'Тестировщик', 'volkov_n', '123', 'user'),
-- Дополнительные сотрудники (14-25)
('Козлов', 'Дмитрий', 'Алексеевич', 'Сборщик', 'kozlov_d', '123', 'user'),
('Лебедева', 'Анна', 'Сергеевна', 'Электрик', 'lebedeva_a', '123', 'user'),
('Соловьев', 'Максим', 'Игоревич', 'Инженер ПСИ', 'solovyev_m', '123', 'user'),
('Григорьев', 'Андрей', 'Владимирович', 'Техник', 'grigoryev_a', '123', 'user'),
('Федорова', 'Екатерина', 'Дмитриевна', 'Сборщик', 'fedorova_e', '123', 'user'),
('Николаев', 'Сергей', 'Петрович', 'Электрик', 'nikolaev_s', '123', 'user'),
('Алексеева', 'Татьяна', 'Михайловна', 'Инженер ПСИ', 'alekseeva_t', '123', 'user'),
('Орлов', 'Виктор', 'Николаевич', 'Сборщик', 'orlov_v', '123', 'user'),
('Степанов', 'Артем', 'Владимирович', 'Электрик', 'stepanov_a', '123', 'user'),
('Макарова', 'Ирина', 'Александровна', 'Инженер ПСИ', 'makarova_i', '123', 'user'),
('Андреев', 'Константин', 'Сергеевич', 'Техник', 'andreev_k', '123', 'user');

-- Получаем ID для справочных значений (используем переменные для однозначности)
SET @bmc_12_id = (SELECT id FROM bmc WHERE version_bmc = '1.2' LIMIT 1);
SET @bmc_13_id = (SELECT id FROM bmc WHERE version_bmc = '1.3' LIMIT 1);
SET @bmc_14_id = (SELECT id FROM bmc WHERE version_bmc = '1.4' LIMIT 1);
SET @bmc_15_id = (SELECT id FROM bmc WHERE version_bmc = '1.5' LIMIT 1);
SET @bmc_20_id = (SELECT id FROM bmc WHERE version_bmc = '2.0' LIMIT 1);
SET @bmc_21_id = (SELECT id FROM bmc WHERE version_bmc = '2.1' LIMIT 1);
SET @bmc_30_id = (SELECT id FROM bmc WHERE version_bmc = '3.0' LIMIT 1);
SET @bmc_31_id = (SELECT id FROM bmc WHERE version_bmc = '3.1' LIMIT 1);
SET @bmc_32_id = (SELECT id FROM bmc WHERE version_bmc = '3.2' LIMIT 1);
SET @bmc_40_id = (SELECT id FROM bmc WHERE version_bmc = '4.0' LIMIT 1);
SET @bmc_switch_10_id = (SELECT id FROM bmc WHERE version_bmc = '1.0' LIMIT 1);
SET @bmc_switch_11_id = (SELECT id FROM bmc WHERE version_bmc = '1.1' LIMIT 1);

SET @uboot_202201_id = (SELECT id FROM uboot WHERE version_uboot = '2022.01' LIMIT 1);
SET @uboot_202204_id = (SELECT id FROM uboot WHERE version_uboot = '2022.04' LIMIT 1);
SET @uboot_202301_id = (SELECT id FROM uboot WHERE version_uboot = '2023.01' LIMIT 1);
SET @uboot_202304_id = (SELECT id FROM uboot WHERE version_uboot = '2023.04' LIMIT 1);
SET @uboot_switch_202301_id = (SELECT id FROM uboot WHERE file_uboot = 'uboot_switch_v2023.01' LIMIT 1);
SET @uboot_switch_202306_id = (SELECT id FROM uboot WHERE file_uboot = 'uboot_switch_v2023.06' LIMIT 1);
SET @uboot_switch_202401_id = (SELECT id FROM uboot WHERE file_uboot = 'uboot_switch_v2024.01' LIMIT 1);
SET @uboot_router_202301_id = (SELECT id FROM uboot WHERE file_uboot = 'uboot_router_v2023.01' LIMIT 1);
SET @uboot_router_202401_id = (SELECT id FROM uboot WHERE file_uboot = 'uboot_router_v2024.01' LIMIT 1);
SET @uboot_router_202406_id = (SELECT id FROM uboot WHERE file_uboot = 'uboot_router_v2024.06' LIMIT 1);
SET @uboot_router_202501_id = (SELECT id FROM uboot WHERE file_uboot = 'uboot_router_v2025.01' LIMIT 1);

SET @iso_60_id = (SELECT id FROM iso WHERE version_iso = '6.0' LIMIT 1);
SET @iso_61_id = (SELECT id FROM iso WHERE version_iso = '6.1' LIMIT 1);
SET @iso_62_id = (SELECT id FROM iso WHERE version_iso = '6.2' LIMIT 1);
SET @iso_63_id = (SELECT id FROM iso WHERE version_iso = '6.3' LIMIT 1);
SET @iso_64_id = (SELECT id FROM iso WHERE version_iso = '6.4' LIMIT 1);
SET @iso_70_id = (SELECT id FROM iso WHERE version_iso = '7.0' LIMIT 1);
SET @iso_71_id = (SELECT id FROM iso WHERE version_iso = '7.1' LIMIT 1);
SET @iso_72_id = (SELECT id FROM iso WHERE version_iso = '7.2' LIMIT 1);
SET @iso_73_id = (SELECT id FROM iso WHERE version_iso = '7.3' LIMIT 1);
SET @iso_switch_30_id = (SELECT id FROM iso WHERE version_iso = '3.0' LIMIT 1);
SET @iso_switch_31_id = (SELECT id FROM iso WHERE version_iso = '3.1' LIMIT 1);
SET @iso_switch_32_id = (SELECT id FROM iso WHERE version_iso = '3.2' LIMIT 1);
SET @iso_switch_40_id = (SELECT id FROM iso WHERE version_iso = '4.0' LIMIT 1);
SET @iso_switch_50_id = (SELECT id FROM iso WHERE version_iso = '5.0' LIMIT 1);

SET @location_stock_id = (SELECT id FROM location WHERE name = 'Склад готовой продукции' LIMIT 1);
SET @location_assembly1_id = (SELECT id FROM location WHERE name = 'Цех сборки №1' LIMIT 1);
SET @location_assembly2_id = (SELECT id FROM location WHERE name = 'Цех сборки №2' LIMIT 1);
SET @location_diagnostic_id = (SELECT id FROM location WHERE name = 'Цех диагностики' LIMIT 1);
SET @location_psi_id = (SELECT id FROM location WHERE name = 'Лаборатория ПСИ' LIMIT 1);
SET @location_packaging_id = (SELECT id FROM location WHERE name = 'Упаковочный цех' LIMIT 1);
SET @location_prog2_id = (SELECT id FROM location WHERE name = 'Цех программирования №2' LIMIT 1);
SET @location_prog3_id = (SELECT id FROM location WHERE name = 'Цех программирования №3' LIMIT 1);
SET @location_prog4_id = (SELECT id FROM location WHERE name = 'Цех программирования №4' LIMIT 1);
SET @location_prog1_id = (SELECT id FROM location WHERE name = 'Цех программирования №1' LIMIT 1);

SET @device_type_rs_id = (SELECT id FROM device_type WHERE code = 'RS' LIMIT 1);
SET @device_type_rb_id = (SELECT id FROM device_type WHERE code = 'RB' LIMIT 1);
SET @device_type_sa_id = (SELECT id FROM device_type WHERE code = 'SA' LIMIT 1);

SET @place_prod_10_id = (SELECT id FROM place_of_production WHERE code = '10' LIMIT 1);
SET @place_prod_12_id = (SELECT id FROM place_of_production WHERE code = '12' LIMIT 1);
SET @place_prod_13_id = (SELECT id FROM place_of_production WHERE code = '13' LIMIT 1);
SET @place_prod_14_id = (SELECT id FROM place_of_production WHERE code = '14' LIMIT 1);
SET @place_prod_16_id = (SELECT id FROM place_of_production WHERE code = '16' LIMIT 1);
SET @place_prod_17_id = (SELECT id FROM place_of_production WHERE code = '17' LIMIT 1);
SET @place_prod_18_id = (SELECT id FROM place_of_production WHERE code = '18' LIMIT 1);
SET @place_prod_19_id = (SELECT id FROM place_of_production WHERE code = '19' LIMIT 1);
SET @place_prod_20_id = (SELECT id FROM place_of_production WHERE code = '20' LIMIT 1);
SET @place_prod_21_id = (SELECT id FROM place_of_production WHERE code = '21' LIMIT 1);
SET @place_prod_22_id = (SELECT id FROM place_of_production WHERE code = '22' LIMIT 1);

SET @prod_month_1_id = (SELECT id FROM production_month WHERE code = '1' LIMIT 1);
SET @prod_month_2_id = (SELECT id FROM production_month WHERE code = '2' LIMIT 1);
SET @prod_month_3_id = (SELECT id FROM production_month WHERE code = '3' LIMIT 1);
SET @prod_month_4_id = (SELECT id FROM production_month WHERE code = '4' LIMIT 1);
SET @prod_month_5_id = (SELECT id FROM production_month WHERE code = '5' LIMIT 1);
SET @prod_month_6_id = (SELECT id FROM production_month WHERE code = '6' LIMIT 1);
SET @prod_month_7_id = (SELECT id FROM production_month WHERE code = '7' LIMIT 1);
SET @prod_month_8_id = (SELECT id FROM production_month WHERE code = '8' LIMIT 1);
SET @prod_month_9_id = (SELECT id FROM production_month WHERE code = '9' LIMIT 1);
SET @prod_month_10_id = (SELECT id FROM production_month WHERE code = '10' LIMIT 1);
SET @prod_month_11_id = (SELECT id FROM production_month WHERE code = '11' LIMIT 1);
SET @prod_month_12_id = (SELECT id FROM production_month WHERE code = '12' LIMIT 1);

SET @prod_year_1_id = (SELECT id FROM production_year WHERE code = '1' LIMIT 1);
SET @prod_year_2_id = (SELECT id FROM production_year WHERE code = '2' LIMIT 1);
SET @prod_year_3_id = (SELECT id FROM production_year WHERE code = '3' LIMIT 1);
SET @prod_year_4_id = (SELECT id FROM production_year WHERE code = '4' LIMIT 1);
SET @prod_year_5_id = (SELECT id FROM production_year WHERE code = '5' LIMIT 1);
SET @prod_year_6_id = (SELECT id FROM production_year WHERE code = '6' LIMIT 1);
SET @prod_year_7_id = (SELECT id FROM production_year WHERE code = '7' LIMIT 1);
SET @prod_year_8_id = (SELECT id FROM production_year WHERE code = '8' LIMIT 1);
SET @prod_year_9_id = (SELECT id FROM production_year WHERE code = '9' LIMIT 1);
SET @prod_year_10_id = (SELECT id FROM production_year WHERE code = '10' LIMIT 1);
SET @prod_year_11_id = (SELECT id FROM production_year WHERE code = '11' LIMIT 1);
SET @prod_year_12_id = (SELECT id FROM production_year WHERE code = '12' LIMIT 1);
SET @prod_year_13_id = (SELECT id FROM production_year WHERE code = '13' LIMIT 1);
SET @prod_year_14_id = (SELECT id FROM production_year WHERE code = '14' LIMIT 1);
SET @prod_year_15_id = (SELECT id FROM production_year WHERE code = '15' LIMIT 1);
SET @prod_year_16_id = (SELECT id FROM production_year WHERE code = '16' LIMIT 1);
SET @prod_year_17_id = (SELECT id FROM production_year WHERE code = '17' LIMIT 1);
SET @prod_year_18_id = (SELECT id FROM production_year WHERE code = '18' LIMIT 1);
SET @prod_year_19_id = (SELECT id FROM production_year WHERE code = '19' LIMIT 1);
SET @prod_year_20_id = (SELECT id FROM production_year WHERE code = '20' LIMIT 1);
SET @prod_year_21_id = (SELECT id FROM production_year WHERE code = '21' LIMIT 1);
SET @prod_year_22_id = (SELECT id FROM production_year WHERE code = '22' LIMIT 1);
SET @prod_year_23_id = (SELECT id FROM production_year WHERE code = '23' LIMIT 1);
SET @prod_year_24_id = (SELECT id FROM production_year WHERE code = '24' LIMIT 1);
SET @prod_year_25_id = (SELECT id FROM production_year WHERE code = '25' LIMIT 1);

SET @prod_stage_5_id = (SELECT id FROM production_stage WHERE code = '5' LIMIT 1);

-- Вставка устройств RS (Сервисные маршрутизаторы) - теперь 13 штук (было 12)
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
-- RS маршрутизаторы (1-13)
(@device_type_rs_id, @place_prod_10_id, @prod_month_6_id, @prod_year_1_id, @prod_stage_5_id, @location_stock_id, @bmc_12_id, @uboot_202201_id, @iso_60_id, 'RS101016430001', '001', '2002-06-15', 'ISN4150873 +10n', 'RouterOS 6.0', true, '2002-06-15 10:00:00', '2002-06-15 14:00:00'),
(@device_type_rs_id, @place_prod_12_id, @prod_month_7_id, @prod_year_2_id, @prod_stage_5_id, @location_stock_id, @bmc_13_id, @uboot_202204_id, @iso_61_id, 'RS102016430002', '002', '2003-07-20', 'ISN4150873 +10n', 'RouterOS 6.1', true, '2003-07-20 10:00:00', '2003-07-20 14:00:00'),
(@device_type_rs_id, @place_prod_13_id, @prod_month_3_id, @prod_year_3_id, @prod_stage_5_id, @location_stock_id, @bmc_14_id, @uboot_202301_id, @iso_62_id, 'RS103016430003', '003', '2004-03-10', 'ISN4150873 +10n', 'RouterOS 6.2', true, '2004-03-10 10:00:00', '2004-03-10 14:00:00'),
(@device_type_rs_id, @place_prod_14_id, @prod_month_9_id, @prod_year_4_id, @prod_stage_5_id, @location_stock_id, @bmc_15_id, @uboot_202304_id, @iso_63_id, 'RS104016430004', '004', '2005-09-25', 'ISN4150873 +10n', 'RouterOS 6.3', true, '2005-09-25 10:00:00', '2005-09-25 14:00:00'),
(@device_type_rs_id, @place_prod_16_id, @prod_month_5_id, @prod_year_5_id, @prod_stage_5_id, @location_stock_id, @bmc_20_id, @uboot_202201_id, @iso_64_id, 'RS105016430005', '005', '2006-05-18', 'ISN4150873 +10n', 'RouterOS 6.4', true, '2006-05-18 10:00:00', '2006-05-18 14:00:00'),
(@device_type_rs_id, @place_prod_10_id, @prod_month_2_id, @prod_year_6_id, @prod_stage_5_id, @location_stock_id, @bmc_20_id, @uboot_202304_id, @iso_64_id, 'RS106016430006', '006', '2007-02-12', 'ISN4150873 +10n', 'RouterOS 6.4', true, '2007-02-12 10:00:00', '2007-02-12 14:00:00'),
(@device_type_rs_id, @place_prod_12_id, @prod_month_8_id, @prod_year_7_id, @prod_stage_5_id, @location_stock_id, @bmc_20_id, @uboot_202301_id, @iso_63_id, 'RS107016430007', '007', '2008-08-05', 'ISN4150873 +10n', 'RouterOS 6.3', true, '2008-08-05 10:00:00', '2008-08-05 14:00:00'),
(@device_type_rs_id, @place_prod_17_id, @prod_month_4_id, @prod_year_8_id, @prod_stage_5_id, @location_stock_id, @bmc_20_id, @uboot_202301_id, @iso_70_id, 'RS108016430008', '008', '2009-04-15', 'ISN4150873 +10n', 'RouterOS 7.0', true, '2009-04-15 10:00:00', '2009-04-15 14:00:00'),
(@device_type_rs_id, @place_prod_18_id, @prod_month_10_id, @prod_year_9_id, @prod_stage_5_id, @location_stock_id, @bmc_21_id, @uboot_202304_id, @iso_70_id, 'RS109016430009', '009', '2010-10-20', 'ISN4150873 +10n', 'RouterOS 7.0', true, '2010-10-20 10:00:00', '2010-10-20 14:00:00'),
(@device_type_rs_id, @place_prod_19_id, @prod_month_1_id, @prod_year_10_id, @prod_stage_5_id, @location_stock_id, @bmc_21_id, @uboot_202401_id, @iso_71_id, 'RS110016430010', '010', '2011-01-25', 'ISN4150873 +10n', 'RouterOS 7.1', true, '2011-01-25 10:00:00', '2011-01-25 14:00:00'),
(@device_type_rs_id, @place_prod_20_id, @prod_month_11_id, @prod_year_11_id, @prod_stage_5_id, @location_stock_id, @bmc_30_id, @uboot_202401_id, @iso_71_id, 'RS111016430011', '011', '2012-11-30', 'ISN4150873 +10n', 'RouterOS 7.1', true, '2012-11-30 10:00:00', '2012-11-30 14:00:00'),
(@device_type_rs_id, @place_prod_16_id, @prod_month_3_id, @prod_year_12_id, @prod_stage_5_id, @location_stock_id, @bmc_31_id, @uboot_202401_id, @iso_71_id, 'RS112016430012', '012', '2013-03-20', 'ISN4150873 +10n', 'RouterOS 7.1', true, '2013-03-20 10:00:00', '2013-03-20 14:00:00'),
-- НОВЫЙ сервисный маршрутизатор (13-й)
(@device_type_rs_id, @place_prod_21_id, @prod_month_5_id, @prod_year_23_id, @prod_stage_5_id, @location_stock_id, @bmc_32_id, @uboot_router_202406_id, @iso_72_id, 'RS113016430013', '013', '2024-05-15', 'ISN4150873 +10n', 'RouterOS 7.2', true, '2024-05-15 10:00:00', '2024-05-15 14:00:00');

-- Вставка коммутаторов SA (Коммутаторы доступа) - теперь 16 штук (было 15)
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
-- ISN42124T5C4 модели (1-5)
(@device_type_sa_id, @place_prod_17_id, @prod_month_1_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_switch_10_id, @uboot_switch_202301_id, @iso_switch_30_id, 'SA101026430001', '001', '2023-01-15', 'ISN42124T5C4', 'SwitchOS 3.0', true, '2023-01-15 10:00:00', '2023-01-15 14:00:00'),
(@device_type_sa_id, @place_prod_17_id, @prod_month_2_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_switch_10_id, @uboot_switch_202301_id, @iso_switch_30_id, 'SA101026430002', '002', '2023-02-20', 'ISN42124T5C4', 'SwitchOS 3.0', true, '2023-02-20 10:00:00', '2023-02-20 14:00:00'),
(@device_type_sa_id, @place_prod_17_id, @prod_month_3_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_switch_11_id, @uboot_switch_202306_id, @iso_switch_31_id, 'SA101026430003', '003', '2023-03-10', 'ISN42124T5C4', 'SwitchOS 3.1', true, '2023-03-10 10:00:00', '2023-03-10 14:00:00'),
(@device_type_sa_id, @place_prod_17_id, @prod_month_4_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_switch_11_id, @uboot_switch_202306_id, @iso_switch_31_id, 'SA101026430004', '004', '2023-04-18', 'ISN42124T5C4', 'SwitchOS 3.1', true, '2023-04-18 10:00:00', '2023-04-18 14:00:00'),
(@device_type_sa_id, @place_prod_17_id, @prod_month_5_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_20_id, @uboot_switch_202306_id, @iso_switch_32_id, 'SA101026430005', '005', '2023-05-22', 'ISN42124T5C4', 'SwitchOS 3.2', true, '2023-05-22 10:00:00', '2023-05-22 14:00:00'),
-- ISN42124T5P5 модели (6-10)
(@device_type_sa_id, @place_prod_18_id, @prod_month_4_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_20_id, @uboot_switch_202306_id, @iso_switch_31_id, 'SA102026430006', '006', '2023-04-05', 'ISN42124T5P5', 'SwitchOS 3.1', true, '2023-04-05 10:00:00', '2023-04-05 14:00:00'),
(@device_type_sa_id, @place_prod_18_id, @prod_month_5_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_20_id, @uboot_switch_202306_id, @iso_switch_32_id, 'SA102026430007', '007', '2023-05-12', 'ISN42124T5P5', 'SwitchOS 3.2', true, '2023-05-12 10:00:00', '2023-05-12 14:00:00'),
(@device_type_sa_id, @place_prod_18_id, @prod_month_6_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA102026430008', '008', '2023-06-18', 'ISN42124T5P5', 'SwitchOS 4.0', true, '2023-06-18 10:00:00', '2023-06-18 14:00:00'),
(@device_type_sa_id, @place_prod_18_id, @prod_month_7_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA102026430009', '009', '2023-07-25', 'ISN42124T5P5', 'SwitchOS 4.0', true, '2023-07-25 10:00:00', '2023-07-25 14:00:00'),
(@device_type_sa_id, @place_prod_18_id, @prod_month_8_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA102026430010', '010', '2023-08-14', 'ISN42124T5P5', 'SwitchOS 4.0', true, '2023-08-14 10:00:00', '2023-08-14 14:00:00'),
-- ISN42124X5 модели (11-13)
(@device_type_sa_id, @place_prod_16_id, @prod_month_7_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA103026430011', '011', '2023-07-22', 'ISN42124X5', 'SwitchOS 4.0', true, '2023-07-22 10:00:00', '2023-07-22 14:00:00'),
(@device_type_sa_id, @place_prod_16_id, @prod_month_8_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA103026430012', '012', '2023-08-30', 'ISN42124X5', 'SwitchOS 4.0', true, '2023-08-30 10:00:00', '2023-08-30 14:00:00'),
(@device_type_sa_id, @place_prod_16_id, @prod_month_9_id, @prod_year_22_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA103026430013', '013', '2023-09-15', 'ISN42124X5', 'SwitchOS 4.0', true, '2023-09-15 10:00:00', '2023-09-15 14:00:00'),
-- Коммутаторы 2024 года (14-15)
(@device_type_sa_id, @place_prod_17_id, @prod_month_1_id, @prod_year_23_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA101026430014', '014', '2024-01-10', 'ISN42124T5C4', 'SwitchOS 4.0', true, '2024-01-10 10:00:00', '2024-01-10 14:00:00'),
(@device_type_sa_id, @place_prod_18_id, @prod_month_2_id, @prod_year_23_id, @prod_stage_5_id, @location_assembly1_id, @bmc_21_id, @uboot_switch_202401_id, @iso_switch_40_id, 'SA102026430015', '015', '2024-02-15', 'ISN42124T5P5', 'SwitchOS 4.0', true, '2024-02-15 10:00:00', '2024-02-15 14:00:00'),
-- НОВЫЙ коммутатор доступа (16-й)
(@device_type_sa_id, @place_prod_22_id, @prod_month_4_id, @prod_year_24_id, @prod_stage_5_id, @location_assembly2_id, @bmc_40_id, @uboot_switch_202401_id, @iso_switch_50_id, 'SA104026430016', '016', '2025-04-20', 'ISN42124X5', 'SwitchOS 5.0', true, '2025-04-20 10:00:00', '2025-04-20 14:00:00');

-- Вставка RB маршрутизаторов (17-19) - исправлено, без дубликатов
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
(@device_type_rb_id, @place_prod_10_id, @prod_month_3_id, @prod_year_20_id, @prod_stage_5_id, @location_stock_id, @bmc_30_id, @uboot_router_202401_id, @iso_71_id, 'RB101026430001', '001', '2021-03-10', 'ISN4200873 +10n', 'RouterOS 7.1', true, '2021-03-10 10:00:00', '2021-03-10 14:00:00'),
(@device_type_rb_id, @place_prod_12_id, @prod_month_6_id, @prod_year_21_id, @prod_stage_5_id, @location_stock_id, @bmc_31_id, @uboot_router_202401_id, @iso_71_id, 'RB102026430002', '002', '2022-06-20', 'ISN4200873 +10n', 'RouterOS 7.1', true, '2022-06-20 10:00:00', '2022-06-20 14:00:00'),
(@device_type_rb_id, @place_prod_14_id, @prod_month_9_id, @prod_year_22_id, @prod_stage_5_id, @location_stock_id, @bmc_31_id, @uboot_router_202401_id, @iso_71_id, 'RB103026430003', '003', '2023-09-05', 'ISN4200873 +10n', 'RouterOS 7.1', true, '2023-09-05 10:00:00', '2023-09-05 14:00:00');

-- Получаем ID всех устройств для дальнейших вставок
-- RS устройства (1-13)
SET @rs1_id = (SELECT id FROM devices WHERE product_serial_number = 'RS101016430001' LIMIT 1);
SET @rs2_id = (SELECT id FROM devices WHERE product_serial_number = 'RS102016430002' LIMIT 1);
SET @rs3_id = (SELECT id FROM devices WHERE product_serial_number = 'RS103016430003' LIMIT 1);
SET @rs4_id = (SELECT id FROM devices WHERE product_serial_number = 'RS104016430004' LIMIT 1);
SET @rs5_id = (SELECT id FROM devices WHERE product_serial_number = 'RS105016430005' LIMIT 1);
SET @rs6_id = (SELECT id FROM devices WHERE product_serial_number = 'RS106016430006' LIMIT 1);
SET @rs7_id = (SELECT id FROM devices WHERE product_serial_number = 'RS107016430007' LIMIT 1);
SET @rs8_id = (SELECT id FROM devices WHERE product_serial_number = 'RS108016430008' LIMIT 1);
SET @rs9_id = (SELECT id FROM devices WHERE product_serial_number = 'RS109016430009' LIMIT 1);
SET @rs10_id = (SELECT id FROM devices WHERE product_serial_number = 'RS110016430010' LIMIT 1);
SET @rs11_id = (SELECT id FROM devices WHERE product_serial_number = 'RS111016430011' LIMIT 1);
SET @rs12_id = (SELECT id FROM devices WHERE product_serial_number = 'RS112016430012' LIMIT 1);
SET @rs13_id = (SELECT id FROM devices WHERE product_serial_number = 'RS113016430013' LIMIT 1);

-- SA устройства (14-29) - общее количество SA: 16 устройств
SET @sa1_id = (SELECT id FROM devices WHERE product_serial_number = 'SA101026430001' LIMIT 1);
SET @sa2_id = (SELECT id FROM devices WHERE product_serial_number = 'SA101026430002' LIMIT 1);
SET @sa3_id = (SELECT id FROM devices WHERE product_serial_number = 'SA101026430003' LIMIT 1);
SET @sa4_id = (SELECT id FROM devices WHERE product_serial_number = 'SA101026430004' LIMIT 1);
SET @sa5_id = (SELECT id FROM devices WHERE product_serial_number = 'SA101026430005' LIMIT 1);
SET @sa6_id = (SELECT id FROM devices WHERE product_serial_number = 'SA102026430006' LIMIT 1);
SET @sa7_id = (SELECT id FROM devices WHERE product_serial_number = 'SA102026430007' LIMIT 1);
SET @sa8_id = (SELECT id FROM devices WHERE product_serial_number = 'SA102026430008' LIMIT 1);
SET @sa9_id = (SELECT id FROM devices WHERE product_serial_number = 'SA102026430009' LIMIT 1);
SET @sa10_id = (SELECT id FROM devices WHERE product_serial_number = 'SA102026430010' LIMIT 1);
SET @sa11_id = (SELECT id FROM devices WHERE product_serial_number = 'SA103026430011' LIMIT 1);
SET @sa12_id = (SELECT id FROM devices WHERE product_serial_number = 'SA103026430012' LIMIT 1);
SET @sa13_id = (SELECT id FROM devices WHERE product_serial_number = 'SA103026430013' LIMIT 1);
SET @sa14_id = (SELECT id FROM devices WHERE product_serial_number = 'SA101026430014' LIMIT 1);
SET @sa15_id = (SELECT id FROM devices WHERE product_serial_number = 'SA102026430015' LIMIT 1);
SET @sa16_id = (SELECT id FROM devices WHERE product_serial_number = 'SA104026430016' LIMIT 1);

-- RB устройства (30-32)
SET @rb1_id = (SELECT id FROM devices WHERE product_serial_number = 'RB101026430001' LIMIT 1);
SET @rb2_id = (SELECT id FROM devices WHERE product_serial_number = 'RB102026430002' LIMIT 1);
SET @rb3_id = (SELECT id FROM devices WHERE product_serial_number = 'RB103026430003' LIMIT 1);

-- Вставка MAC-адресов для всех устройств
INSERT INTO macs (device_id, mac_address, interface_name, assignment_date) VALUES
-- Маршрутизаторы RS (1-13)
(@rs1_id, '00:1B:44:11:3A:B7', 'eth0', '2002-06-15'),
(@rs1_id, '00:1B:44:11:3A:B8', 'eth1', '2002-06-15'),
(@rs2_id, '00:1B:44:11:3A:B9', 'eth0', '2003-07-20'),
(@rs2_id, '00:1B:44:11:3A:BA', 'eth1', '2003-07-20'),
(@rs3_id, '00:1B:44:11:3A:BB', 'eth0', '2004-03-10'),
(@rs3_id, '00:1B:44:11:3A:BC', 'eth1', '2004-03-10'),
(@rs4_id, '00:1B:44:11:3A:BD', 'eth0', '2005-09-25'),
(@rs4_id, '00:1B:44:11:3A:BE', 'eth1', '2005-09-25'),
(@rs5_id, '00:1B:44:11:3A:BF', 'eth0', '2006-05-18'),
(@rs5_id, '00:1B:44:11:3A:C0', 'eth1', '2006-05-18'),
(@rs6_id, '00:1B:44:11:3A:C1', 'eth0', '2007-02-12'),
(@rs6_id, '00:1B:44:11:3A:C2', 'eth1', '2007-02-12'),
(@rs7_id, '00:1B:44:11:3A:C3', 'eth0', '2008-08-05'),
(@rs7_id, '00:1B:44:11:3A:C4', 'eth1', '2008-08-05'),
(@rs8_id, '00:1B:44:11:3A:C5', 'eth0', '2009-04-15'),
(@rs8_id, '00:1B:44:11:3A:C6', 'eth1', '2009-04-15'),
(@rs9_id, '00:1B:44:11:3A:C7', 'eth0', '2010-10-20'),
(@rs9_id, '00:1B:44:11:3A:C8', 'eth1', '2010-10-20'),
(@rs10_id, '00:1B:44:11:3A:C9', 'eth0', '2011-01-25'),
(@rs10_id, '00:1B:44:11:3A:D0', 'eth1', '2011-01-25'),
(@rs11_id, '00:1B:44:11:3A:D1', 'eth0', '2012-11-30'),
(@rs11_id, '00:1B:44:11:3A:D2', 'eth1', '2012-11-30'),
(@rs12_id, '00:1B:44:11:3A:D3', 'eth0', '2013-03-20'),
(@rs12_id, '00:1B:44:11:3A:D4', 'eth1', '2013-03-20'),
(@rs13_id, '00:1B:44:11:3A:D5', 'eth0', '2024-05-15'),
(@rs13_id, '00:1B:44:11:3A:D6', 'eth1', '2024-05-15'),

-- Коммутаторы SA (14-29) - для каждого по 3 MAC-адреса
(@sa1_id, '00:1C:44:11:3A:E1', 'eth0', '2023-01-15'),
(@sa1_id, '00:1C:44:11:3A:E2', 'eth1', '2023-01-15'),
(@sa1_id, '00:1C:44:11:3A:E3', 'management', '2023-01-15'),
(@sa2_id, '00:1C:44:11:3A:E4', 'eth0', '2023-02-20'),
(@sa2_id, '00:1C:44:11:3A:E5', 'eth1', '2023-02-20'),
(@sa2_id, '00:1C:44:11:3A:E6', 'management', '2023-02-20'),
(@sa3_id, '00:1C:44:11:3A:E7', 'eth0', '2023-03-10'),
(@sa3_id, '00:1C:44:11:3A:E8', 'eth1', '2023-03-10'),
(@sa3_id, '00:1C:44:11:3A:E9', 'management', '2023-03-10'),
(@sa4_id, '00:1C:44:11:3A:F0', 'eth0', '2023-04-18'),
(@sa4_id, '00:1C:44:11:3A:F1', 'eth1', '2023-04-18'),
(@sa4_id, '00:1C:44:11:3A:F2', 'management', '2023-04-18'),
(@sa5_id, '00:1C:44:11:3A:F3', 'eth0', '2023-05-22'),
(@sa5_id, '00:1C:44:11:3A:F4', 'eth1', '2023-05-22'),
(@sa5_id, '00:1C:44:11:3A:F5', 'management', '2023-05-22'),
(@sa6_id, '00:1C:44:11:3A:F6', 'eth0', '2023-04-05'),
(@sa6_id, '00:1C:44:11:3A:F7', 'eth1', '2023-04-05'),
(@sa6_id, '00:1C:44:11:3A:F8', 'management', '2023-04-05'),
(@sa7_id, '00:1C:44:11:3A:F9', 'eth0', '2023-05-12'),
(@sa7_id, '00:1C:44:11:3A:G0', 'eth1', '2023-05-12'),
(@sa7_id, '00:1C:44:11:3A:G1', 'management', '2023-05-12'),
(@sa8_id, '00:1C:44:11:3A:G2', 'eth0', '2023-06-18'),
(@sa8_id, '00:1C:44:11:3A:G3', 'eth1', '2023-06-18'),
(@sa8_id, '00:1C:44:11:3A:G4', 'management', '2023-06-18'),
(@sa9_id, '00:1C:44:11:3A:G5', 'eth0', '2023-07-25'),
(@sa9_id, '00:1C:44:11:3A:G6', 'eth1', '2023-07-25'),
(@sa9_id, '00:1C:44:11:3A:G7', 'management', '2023-07-25'),
(@sa10_id, '00:1C:44:11:3A:G8', 'eth0', '2023-08-14'),
(@sa10_id, '00:1C:44:11:3A:G9', 'eth1', '2023-08-14'),
(@sa10_id, '00:1C:44:11:3A:H0', 'management', '2023-08-14'),
(@sa11_id, '00:1C:44:11:3A:H1', 'eth0', '2023-07-22'),
(@sa11_id, '00:1C:44:11:3A:H2', 'eth1', '2023-07-22'),
(@sa11_id, '00:1C:44:11:3A:H3', 'management', '2023-07-22'),
(@sa12_id, '00:1C:44:11:3A:H4', 'eth0', '2023-08-30'),
(@sa12_id, '00:1C:44:11:3A:H5', 'eth1', '2023-08-30'),
(@sa12_id, '00:1C:44:11:3A:H6', 'management', '2023-08-30'),
(@sa13_id, '00:1C:44:11:3A:H7', 'eth0', '2023-09-15'),
(@sa13_id, '00:1C:44:11:3A:H8', 'eth1', '2023-09-15'),
(@sa13_id, '00:1C:44:11:3A:H9', 'management', '2023-09-15'),
(@sa14_id, '00:1C:44:11:3A:I0', 'eth0', '2024-01-10'),
(@sa14_id, '00:1C:44:11:3A:I1', 'eth1', '2024-01-10'),
(@sa14_id, '00:1C:44:11:3A:I2', 'management', '2024-01-10'),
(@sa15_id, '00:1C:44:11:3A:I3', 'eth0', '2024-02-15'),
(@sa15_id, '00:1C:44:11:3A:I4', 'eth1', '2024-02-15'),
(@sa15_id, '00:1C:44:11:3A:I5', 'management', '2024-02-15'),
(@sa16_id, '00:1C:44:11:3A:I6', 'eth0', '2025-04-20'),
(@sa16_id, '00:1C:44:11:3A:I7', 'eth1', '2025-04-20'),
(@sa16_id, '00:1C:44:11:3A:I8', 'management', '2025-04-20'),

-- RB маршрутизаторы (30-32)
(@rb1_id, '00:1D:44:11:3A:J1', 'eth0', '2021-03-10'),
(@rb1_id, '00:1D:44:11:3A:J2', 'eth1', '2021-03-10'),
(@rb1_id, '00:1D:44:11:3A:J3', 'management', '2021-03-10'),
(@rb2_id, '00:1D:44:11:3A:J4', 'eth0', '2022-06-20'),
(@rb2_id, '00:1D:44:11:3A:J5', 'eth1', '2022-06-20'),
(@rb2_id, '00:1D:44:11:3A:J6', 'management', '2022-06-20'),
(@rb3_id, '00:1D:44:11:3A:J7', 'eth0', '2023-09-05'),
(@rb3_id, '00:1D:44:11:3A:J8', 'eth1', '2023-09-05'),
(@rb3_id, '00:1D:44:11:3A:J9', 'management', '2023-09-05');

-- Серийные номера для маршрутизаторов RS (1-13)
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(@rs1_id, 'SNB00123001', true, 'Иванов А.П.', '2002-06-10 10:00:00'),
(@rs2_id, 'SNB00123002', true, 'Петров С.И.', '2003-07-15 11:30:00'),
(@rs3_id, 'SNB00123003', true, 'Иванов А.П.', '2004-03-05 09:45:00'),
(@rs4_id, 'SNB00123004', true, 'Петров С.И.', '2005-09-20 14:20:00'),
(@rs5_id, 'SNB00123005', true, 'Иванов А.П.', '2006-05-12 16:10:00'),
(@rs6_id, 'SNB00123006', true, 'Петров С.И.', '2007-02-10 10:30:00'),
(@rs7_id, 'SNB00123007', true, 'Иванов А.П.', '2008-08-03 13:15:00'),
(@rs8_id, 'SNB00123008', true, 'Петров С.И.', '2009-04-10 11:00:00'),
(@rs9_id, 'SNB00123009', true, 'Иванов А.П.', '2010-10-15 14:30:00'),
(@rs10_id, 'SNB00123010', true, 'Петров С.И.', '2011-01-20 09:45:00'),
(@rs11_id, 'SNB00123011', true, 'Иванов А.П.', '2012-11-25 16:20:00'),
(@rs12_id, 'SNB00123012', true, 'Петров С.И.', '2013-05-10 13:15:00'),
(@rs13_id, 'SNB00123013', true, 'Соколов А.В.', '2024-05-10 10:00:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(@rs1_id, 'PCBSN00123001'), (@rs2_id, 'PCBSN00123002'), (@rs3_id, 'PCBSN00123003'),
(@rs4_id, 'PCBSN00123004'), (@rs5_id, 'PCBSN00123005'), (@rs6_id, 'PCBSN00123006'),
(@rs7_id, 'PCBSN00123007'), (@rs8_id, 'PCBSN00123008'), (@rs9_id, 'PCBSN00123009'),
(@rs10_id, 'PCBSN00123010'), (@rs11_id, 'PCBSN00123011'), (@rs12_id, 'PCBSN00123012'),
(@rs13_id, 'PCBSN00123013');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(@rs1_id, 'ROUTER00123001'), (@rs2_id, 'ROUTER00123002'), (@rs3_id, 'ROUTER00123003'),
(@rs4_id, 'ROUTER00123004'), (@rs5_id, 'ROUTER00123005'), (@rs6_id, 'ROUTER00123006'),
(@rs7_id, 'ROUTER00123007'), (@rs8_id, 'ROUTER00123008'), (@rs9_id, 'ROUTER00123009'),
(@rs10_id, 'ROUTER00123010'), (@rs11_id, 'ROUTER00123011'), (@rs12_id, 'ROUTER00123012'),
(@rs13_id, 'ROUTER00123013');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(@rs1_id, 'PKG00123001'), (@rs2_id, 'PKG00123002'), (@rs3_id, 'PKG00123003'),
(@rs4_id, 'PKG00123004'), (@rs5_id, 'PKG00123005'), (@rs6_id, 'PKG00123006'),
(@rs7_id, 'PKG00123007'), (@rs8_id, 'PKG00123008'), (@rs9_id, 'PKG00123009'),
(@rs10_id, 'PKG00123010'), (@rs11_id, 'PKG00123011'), (@rs12_id, 'PKG00123012'),
(@rs13_id, 'PKG00123013');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(@rs1_id, 'CASE00123001'), (@rs2_id, 'CASE00123002'), (@rs3_id, 'CASE00123003'),
(@rs4_id, 'CASE00123004'), (@rs5_id, 'CASE00123005'), (@rs6_id, 'CASE00123006'),
(@rs7_id, 'CASE00123007'), (@rs8_id, 'CASE00123008'), (@rs9_id, 'CASE00123009'),
(@rs10_id, 'CASE00123010'), (@rs11_id, 'CASE00123011'), (@rs12_id, 'CASE00123012'),
(@rs13_id, 'CASE00123013');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(@rs1_id, 'BP00123001'), (@rs2_id, 'BP00123002'), (@rs3_id, 'BP00123003'),
(@rs4_id, 'BP00123004'), (@rs5_id, 'BP00123005'), (@rs6_id, 'BP00123006'),
(@rs7_id, 'BP00123007'), (@rs8_id, 'BP00123008'), (@rs9_id, 'BP00123009'),
(@rs10_id, 'BP00123010'), (@rs11_id, 'BP00123011'), (@rs12_id, 'BP00123012'),
(@rs13_id, 'BP00123013');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(@rs1_id, 'PKI00123001'), (@rs2_id, 'PKI00123002'), (@rs3_id, 'PKI00123003'),
(@rs4_id, 'PKI00123004'), (@rs5_id, 'PKI00123005'), (@rs6_id, 'PKI00123006'),
(@rs7_id, 'PKI00123007'), (@rs8_id, 'PKI00123008'), (@rs9_id, 'PKI00123009'),
(@rs10_id, 'PKI00123010'), (@rs11_id, 'PKI00123011'), (@rs12_id, 'PKI00123012'),
(@rs13_id, 'PKI00123013');

-- Серийные номера для коммутаторов SA (14-29)
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(@sa1_id, 'SNB00223001', true, 'Соколов А.В.', '2023-01-14 09:30:00'),
(@sa2_id, 'SNB00223002', true, 'Михайлов Д.С.', '2023-02-19 10:15:00'),
(@sa3_id, 'SNB00223003', true, 'Соколов А.В.', '2023-03-09 11:45:00'),
(@sa4_id, 'SNB00223004', true, 'Михайлов Д.С.', '2023-04-17 13:20:00'),
(@sa5_id, 'SNB00223005', true, 'Соколов А.В.', '2023-05-21 14:30:00'),
(@sa6_id, 'SNB00223006', true, 'Михайлов Д.С.', '2023-04-04 13:20:00'),
(@sa7_id, 'SNB00223007', true, 'Соколов А.В.', '2023-05-11 14:30:00'),
(@sa8_id, 'SNB00223008', true, 'Михайлов Д.С.', '2023-06-17 15:45:00'),
(@sa9_id, 'SNB00223009', true, 'Соколов А.В.', '2023-07-24 10:00:00'),
(@sa10_id, 'SNB00223010', true, 'Михайлов Д.С.', '2023-08-13 16:20:00'),
(@sa11_id, 'SNB00223011', true, 'Соколов А.В.', '2023-07-21 10:00:00'),
(@sa12_id, 'SNB00223012', true, 'Михайлов Д.С.', '2023-08-29 16:20:00'),
(@sa13_id, 'SNB00223013', true, 'Соколов А.В.', '2023-09-14 11:00:00'),
(@sa14_id, 'SNB00223014', true, 'Михайлов Д.С.', '2024-01-09 14:30:00'),
(@sa15_id, 'SNB00223015', true, 'Соколов А.В.', '2024-02-14 11:00:00'),
(@sa16_id, 'SNB00223016', true, 'Орлов В.Н.', '2025-04-15 10:30:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(@sa1_id, 'PCBSN00223001'), (@sa2_id, 'PCBSN00223002'), (@sa3_id, 'PCBSN00223003'),
(@sa4_id, 'PCBSN00223004'), (@sa5_id, 'PCBSN00223005'), (@sa6_id, 'PCBSN00223006'),
(@sa7_id, 'PCBSN00223007'), (@sa8_id, 'PCBSN00223008'), (@sa9_id, 'PCBSN00223009'),
(@sa10_id, 'PCBSN00223010'), (@sa11_id, 'PCBSN00223011'), (@sa12_id, 'PCBSN00223012'),
(@sa13_id, 'PCBSN00223013'), (@sa14_id, 'PCBSN00223014'), (@sa15_id, 'PCBSN00223015'),
(@sa16_id, 'PCBSN00223016');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(@sa1_id, 'SWRTR00223001'), (@sa2_id, 'SWRTR00223002'), (@sa3_id, 'SWRTR00223003'),
(@sa4_id, 'SWRTR00223004'), (@sa5_id, 'SWRTR00223005'), (@sa6_id, 'SWRTR00223006'),
(@sa7_id, 'SWRTR00223007'), (@sa8_id, 'SWRTR00223008'), (@sa9_id, 'SWRTR00223009'),
(@sa10_id, 'SWRTR00223010'), (@sa11_id, 'SWRTR00223011'), (@sa12_id, 'SWRTR00223012'),
(@sa13_id, 'SWRTR00223013'), (@sa14_id, 'SWRTR00223014'), (@sa15_id, 'SWRTR00223015'),
(@sa16_id, 'SWRTR00223016');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(@sa1_id, 'PKG00223001'), (@sa2_id, 'PKG00223002'), (@sa3_id, 'PKG00223003'),
(@sa4_id, 'PKG00223004'), (@sa5_id, 'PKG00223005'), (@sa6_id, 'PKG00223006'),
(@sa7_id, 'PKG00223007'), (@sa8_id, 'PKG00223008'), (@sa9_id, 'PKG00223009'),
(@sa10_id, 'PKG00223010'), (@sa11_id, 'PKG00223011'), (@sa12_id, 'PKG00223012'),
(@sa13_id, 'PKG00223013'), (@sa14_id, 'PKG00223014'), (@sa15_id, 'PKG00223015'),
(@sa16_id, 'PKG00223016');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(@sa1_id, 'CASE00223001'), (@sa2_id, 'CASE00223002'), (@sa3_id, 'CASE00223003'),
(@sa4_id, 'CASE00223004'), (@sa5_id, 'CASE00223005'), (@sa6_id, 'CASE00223006'),
(@sa7_id, 'CASE00223007'), (@sa8_id, 'CASE00223008'), (@sa9_id, 'CASE00223009'),
(@sa10_id, 'CASE00223010'), (@sa11_id, 'CASE00223011'), (@sa12_id, 'CASE00223012'),
(@sa13_id, 'CASE00223013'), (@sa14_id, 'CASE00223014'), (@sa15_id, 'CASE00223015'),
(@sa16_id, 'CASE00223016');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(@sa1_id, 'BP00223001'), (@sa2_id, 'BP00223002'), (@sa3_id, 'BP00223003'),
(@sa4_id, 'BP00223004'), (@sa5_id, 'BP00223005'), (@sa6_id, 'BP00223006'),
(@sa7_id, 'BP00223007'), (@sa8_id, 'BP00223008'), (@sa9_id, 'BP00223009'),
(@sa10_id, 'BP00223010'), (@sa11_id, 'BP00223011'), (@sa12_id, 'BP00223012'),
(@sa13_id, 'BP00223013'), (@sa14_id, 'BP00223014'), (@sa15_id, 'BP00223015'),
(@sa16_id, 'BP00223016');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(@sa1_id, 'PKI00223001'), (@sa2_id, 'PKI00223002'), (@sa3_id, 'PKI00223003'),
(@sa4_id, 'PKI00223004'), (@sa5_id, 'PKI00223005'), (@sa6_id, 'PKI00223006'),
(@sa7_id, 'PKI00223007'), (@sa8_id, 'PKI00223008'), (@sa9_id, 'PKI00223009'),
(@sa10_id, 'PKI00223010'), (@sa11_id, 'PKI00223011'), (@sa12_id, 'PKI00223012'),
(@sa13_id, 'PKI00223013'), (@sa14_id, 'PKI00223014'), (@sa15_id, 'PKI00223015'),
(@sa16_id, 'PKI00223016');

-- Серийные номера для RB маршрутизаторов (30-32)
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(@rb1_id, 'SNB00323001', true, 'Козлов Д.А.', '2021-03-08 10:30:00'),
(@rb2_id, 'SNB00323002', true, 'Федорова Е.Д.', '2022-06-18 11:45:00'),
(@rb3_id, 'SNB00323003', true, 'Козлов Д.А.', '2023-09-03 14:15:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(@rb1_id, 'PCBSN00323001'), (@rb2_id, 'PCBSN00323002'), (@rb3_id, 'PCBSN00323003');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(@rb1_id, 'RBROUTER00123001'), (@rb2_id, 'RBROUTER00123002'), (@rb3_id, 'RBROUTER00123003');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(@rb1_id, 'PKG00323001'), (@rb2_id, 'PKG00323002'), (@rb3_id, 'PKG00323003');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(@rb1_id, 'CASE00323001'), (@rb2_id, 'CASE00323002'), (@rb3_id, 'CASE00323003');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(@rb1_id, 'BP00323001'), (@rb2_id, 'BP00323002'), (@rb3_id, 'BP00323003');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(@rb1_id, 'PKI00323001'), (@rb2_id, 'PKI00323002'), (@rb3_id, 'PKI00323003');

-- Обновление внешних ключей для всех устройств с использованием динамического SQL
-- Для RS устройств (1-13)
UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = @rs1_id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = @rs1_id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = @rs1_id AND interface_name = 'eth0' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = @rs1_id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = @rs1_id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = @rs1_id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = @rs1_id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = @rs1_id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = @rs1_id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = @rs1_id LIMIT 1)
WHERE id = @rs1_id;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = @rs2_id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = @rs2_id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = @rs2_id AND interface_name = 'eth0' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = @rs2_id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = @rs2_id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = @rs2_id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = @rs2_id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = @rs2_id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = @rs2_id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = @rs2_id LIMIT 1)
WHERE id = @rs2_id;

-- Продолжение для всех RS устройств (3-13) - аналогично
UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = @rs3_id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = @rs3_id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = @rs3_id AND interface_name = 'eth0' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = @rs3_id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = @rs3_id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = @rs3_id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = @rs3_id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = @rs3_id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = @rs3_id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = @rs3_id LIMIT 1)
WHERE id = @rs3_id;

-- Добавьте аналогично для rs4-rs13

-- Для SA устройств (14-29) - пример для первого
UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = @sa1_id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = @sa1_id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = @sa1_id AND interface_name = 'management' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = @sa1_id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = @sa1_id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = @sa1_id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = @sa1_id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = @sa1_id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = @sa1_id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = @sa1_id LIMIT 1)
WHERE id = @sa1_id;

-- Добавьте аналогично для всех SA устройств (sa2-sa16)

-- Для RB устройств (30-32)
UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = @rb1_id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = @rb1_id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = @rb1_id AND interface_name = 'management' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = @rb1_id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = @rb1_id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = @rb1_id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = @rb1_id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = @rb1_id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = @rb1_id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = @rb1_id LIMIT 1)
WHERE id = @rb1_id;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = @rb2_id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = @rb2_id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = @rb2_id AND interface_name = 'management' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = @rb2_id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = @rb2_id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = @rb2_id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = @rb2_id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = @rb2_id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = @rb2_id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = @rb2_id LIMIT 1)
WHERE id = @rb2_id;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = @rb3_id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = @rb3_id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = @rb3_id AND interface_name = 'management' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = @rb3_id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = @rb3_id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = @rb3_id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = @rb3_id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = @rb3_id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = @rb3_id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = @rb3_id LIMIT 1)
WHERE id = @rb3_id;

-- Добавление внешних ключей для связанных таблиц
ALTER TABLE macs ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;
ALTER TABLE serial_num_board ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;
ALTER TABLE serial_num_pcb ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;
ALTER TABLE serial_num_router ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;
ALTER TABLE serial_num_pki ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;
ALTER TABLE serial_num_bp ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;
ALTER TABLE serial_num_package ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;
ALTER TABLE serial_num_case ADD FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

ALTER TABLE devices 
ADD FOREIGN KEY (eth1addr_id) REFERENCES macs(id),
ADD FOREIGN KEY (eth2addr_id) REFERENCES macs(id),
ADD FOREIGN KEY (ethaddr_id) REFERENCES macs(id),
ADD FOREIGN KEY (serial_num_board_id) REFERENCES serial_num_board(id),
ADD FOREIGN KEY (serial_num_pcb_id) REFERENCES serial_num_pcb(id),
ADD FOREIGN KEY (serial_num_router_id) REFERENCES serial_num_router(id),
ADD FOREIGN KEY (serial_num_package_id) REFERENCES serial_num_package(id),
ADD FOREIGN KEY (serial_num_case_id) REFERENCES serial_num_case(id),
ADD FOREIGN KEY (serial_num_bp_id) REFERENCES serial_num_bp(id),
ADD FOREIGN KEY (serial_num_pki_id) REFERENCES serial_num_pki(id);

-- Вставка данных о сборке для маршрутизаторов RS (1-13)
INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(1, @rs1_id, '2002-06-12'), (2, @rs2_id, '2003-07-17'), (1, @rs3_id, '2004-03-07'),
(2, @rs4_id, '2005-09-22'), (1, @rs5_id, '2006-05-15'), (2, @rs6_id, '2007-02-10'),
(1, @rs7_id, '2008-08-03'), (2, @rs8_id, '2009-04-12'), (1, @rs9_id, '2010-10-18'),
(2, @rs10_id, '2011-01-22'), (1, @rs11_id, '2012-11-27'), (2, @rs12_id, '2013-05-12'),
(9, @rs13_id, '2024-05-12');

-- Вставка данных о сборке для коммутаторов SA (14-29)
INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(9, @sa1_id, '2023-01-14'), (10, @sa2_id, '2023-02-19'), (9, @sa3_id, '2023-03-09'),
(10, @sa4_id, '2023-04-17'), (9, @sa5_id, '2023-05-21'), (10, @sa6_id, '2023-04-04'),
(9, @sa7_id, '2023-05-11'), (10, @sa8_id, '2023-06-17'), (9, @sa9_id, '2023-07-24'),
(10, @sa10_id, '2023-08-13'), (9, @sa11_id, '2023-07-21'), (10, @sa12_id, '2023-08-29'),
(9, @sa13_id, '2023-09-14'), (10, @sa14_id, '2024-01-09'), (9, @sa15_id, '2024-02-14'),
(21, @sa16_id, '2025-04-18');

-- Вставка данных о сборке для RB маршрутизаторов (30-32)
INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(14, @rb1_id, '2021-03-08'), (17, @rb2_id, '2022-06-18'), (14, @rb3_id, '2023-09-03');

-- Вставка данных о диагностике для маршрутизаторов RS (1-13)
INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(3, @rs1_id, '2002-06-13', 'Диагностика пройдена успешно'),
(4, @rs2_id, '2003-07-18', 'Все системы функционируют нормально'),
(3, @rs3_id, '2004-03-08', 'Диагностика без замечаний'),
(4, @rs4_id, '2005-09-23', 'Оборудование соответствует ТУ'),
(3, @rs5_id, '2006-05-16', 'Диагностика пройдена'),
(4, @rs6_id, '2007-02-11', 'Все параметры в норме'),
(3, @rs7_id, '2008-08-04', 'Диагностика успешна'),
(4, @rs8_id, '2009-04-13', 'Диагностика пройдена'),
(3, @rs9_id, '2010-10-19', 'Все системы в норме'),
(4, @rs10_id, '2011-01-23', 'Диагностика успешна'),
(3, @rs11_id, '2012-11-28', 'Оборудование исправно'),
(4, @rs12_id, '2013-05-13', 'Диагностика пройдена'),
(11, @rs13_id, '2024-05-13', 'Диагностика успешно пройдена');

-- Вставка данных о диагностике для коммутаторов SA (14-29)
INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(11, @sa1_id, '2023-01-14', 'Диагностика успешно пройдена, PoE работает корректно'),
(11, @sa2_id, '2023-02-19', 'Все порты функционируют нормально'),
(11, @sa3_id, '2023-03-09', 'Диагностика без замечаний, температура в норме'),
(11, @sa4_id, '2023-04-17', 'PoE питание в норме'),
(11, @sa5_id, '2023-05-21', 'Все системы функционируют нормально'),
(11, @sa6_id, '2023-04-04', 'PoE питание в норме, коммутатор готов к работе'),
(11, @sa7_id, '2023-05-11', 'Все системы функционируют нормально'),
(11, @sa8_id, '2023-06-17', 'Диагностика пройдена успешно'),
(11, @sa9_id, '2023-07-24', 'Соответствует техническим условиям'),
(11, @sa10_id, '2023-08-13', 'Диагностика пройдена, ошибок не обнаружено'),
(11, @sa11_id, '2023-07-21', 'Соответствует техническим условиям'),
(11, @sa12_id, '2023-08-29', 'Диагностика пройдена, ошибок не обнаружено'),
(11, @sa13_id, '2023-09-14', 'PoE функционирует корректно'),
(11, @sa14_id, '2024-01-09', 'PoE функционирует корректно'),
(11, @sa15_id, '2024-02-14', 'Диагностика успешна'),
(22, @sa16_id, '2025-04-19', 'Диагностика успешно пройдена');

-- Вставка данных о диагностике для RB маршрутизаторов (30-32)
INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(15, @rb1_id, '2021-03-09', 'Диагностика пройдена успешно'),
(18, @rb2_id, '2022-06-19', 'Все системы функционируют нормально'),
(15, @rb3_id, '2023-09-04', 'Диагностика успешна');

-- Вставка данных о ПСИ для маршрутизаторов RS (1-13)
INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(5, @rs1_id, '2002-06-14', 'Испытания пройдены', 'PSI-2002-001'),
(5, @rs2_id, '2003-07-19', 'Соответствует требованиям', 'PSI-2003-002'),
(5, @rs3_id, '2004-03-09', 'Успешное завершение ПСИ', 'PSI-2004-003'),
(5, @rs4_id, '2005-09-24', 'Испытания пройдены', 'PSI-2005-004'),
(5, @rs5_id, '2006-05-17', 'Соответствует спецификациям', 'PSI-2006-005'),
(5, @rs6_id, '2007-02-12', 'Испытания пройдены', 'PSI-2007-006'),
(5, @rs7_id, '2008-08-05', 'Соответствует требованиям', 'PSI-2008-007'),
(5, @rs8_id, '2009-04-14', 'Испытания пройдены', 'PSI-2009-008'),
(5, @rs9_id, '2010-10-20', 'Соответствует спецификации', 'PSI-2010-009'),
(5, @rs10_id, '2011-01-24', 'Испытания пройдены', 'PSI-2011-010'),
(5, @rs11_id, '2012-11-29', 'Соответствует требованиям', 'PSI-2012-011'),
(5, @rs12_id, '2013-05-14', 'Испытания пройдены', 'PSI-2013-012'),
(12, @rs13_id, '2024-05-14', 'Испытания пройдены успешно', 'PSI-2024-013');

-- Вставка данных о ПСИ для коммутаторов SA (14-29)
INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(12, @sa1_id, '2023-01-15', 'Испытания пройдены, соответствует спецификации', 'PSI-2023-013'),
(12, @sa2_id, '2023-02-20', 'Успешное завершение ПСИ', 'PSI-2023-014'),
(12, @sa3_id, '2023-03-10', 'Испытания пройдены', 'PSI-2023-015'),
(12, @sa4_id, '2023-04-18', 'Соответствует требованиям ТУ', 'PSI-2023-016'),
(12, @sa5_id, '2023-05-22', 'Испытания пройдены успешно', 'PSI-2023-017'),
(12, @sa6_id, '2023-04-05', 'Соответствует требованиям ТУ', 'PSI-2023-018'),
(12, @sa7_id, '2023-05-12', 'Испытания пройдены успешно', 'PSI-2023-019'),
(12, @sa8_id, '2023-06-18', 'Соответствует спецификации', 'PSI-2023-020'),
(12, @sa9_id, '2023-07-25', 'Испытания пройдены', 'PSI-2023-021'),
(12, @sa10_id, '2023-08-14', 'Успешное завершение ПСИ', 'PSI-2023-022'),
(12, @sa11_id, '2023-07-22', 'Испытания пройдены', 'PSI-2023-023'),
(12, @sa12_id, '2023-08-30', 'Успешное завершение ПСИ', 'PSI-2023-024'),
(12, @sa13_id, '2023-09-15', 'Соответствует спецификации', 'PSI-2023-025'),
(12, @sa14_id, '2024-01-10', 'Испытания пройдены', 'PSI-2024-001'),
(12, @sa15_id, '2024-02-15', 'Соответствует требованиям', 'PSI-2024-002'),
(23, @sa16_id, '2025-04-20', 'Испытания пройдены', 'PSI-2025-001');

-- Вставка данных о ПСИ для RB маршрутизаторов (30-32)
INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(16, @rb1_id, '2021-03-10', 'Испытания пройдены', 'PSI-2021-001'),
(19, @rb2_id, '2022-06-20', 'Соответствует требованиям', 'PSI-2022-001'),
(16, @rb3_id, '2023-09-05', 'Испытания пройдены', 'PSI-2023-026');

-- Вставка данных о программировании для коммутаторов SA (14-29)
INSERT INTO programmers (device_id, ip, place, serial_number, stand, type) VALUES
(@sa1_id, '192.168.1.113', 'Цех программирования №2', 'PRG013', 'Стенд А-13', 'ISN42124T5C4'),
(@sa2_id, '192.168.1.114', 'Цех программирования №2', 'PRG014', 'Стенд А-14', 'ISN42124T5C4'),
(@sa3_id, '192.168.1.115', 'Цех программирования №2', 'PRG015', 'Стенд А-15', 'ISN42124T5C4'),
(@sa4_id, '192.168.1.116', 'Цех программирования №2', 'PRG016', 'Стенд А-16', 'ISN42124T5C4'),
(@sa5_id, '192.168.1.117', 'Цех программирования №2', 'PRG017', 'Стенд А-17', 'ISN42124T5C4'),
(@sa6_id, '192.168.1.118', 'Цех программирования №3', 'PRG018', 'Стенд Б-5', 'ISN42124T5P5'),
(@sa7_id, '192.168.1.119', 'Цех программирования №3', 'PRG019', 'Стенд Б-6', 'ISN42124T5P5'),
(@sa8_id, '192.168.1.120', 'Цех программирования №3', 'PRG020', 'Стенд Б-7', 'ISN42124T5P5'),
(@sa9_id, '192.168.1.121', 'Цех программирования №3', 'PRG021', 'Стенд Б-8', 'ISN42124T5P5'),
(@sa10_id, '192.168.1.122', 'Цех программирования №3', 'PRG022', 'Стенд Б-9', 'ISN42124T5P5'),
(@sa11_id, '192.168.1.123', 'Цех программирования №4', 'PRG023', 'Стенд В-3', 'ISN42124X5'),
(@sa12_id, '192.168.1.124', 'Цех программирования №4', 'PRG024', 'Стенд В-4', 'ISN42124X5'),
(@sa13_id, '192.168.1.125', 'Цех программирования №4', 'PRG025', 'Стенд В-5', 'ISN42124X5'),
(@sa14_id, '192.168.1.126', 'Цех программирования №2', 'PRG026', 'Стенд А-26', 'ISN42124T5C4'),
(@sa15_id, '192.168.1.127', 'Цех программирования №3', 'PRG027', 'Стенд Б-10', 'ISN42124T5P5'),
(@sa16_id, '192.168.1.128', 'Цех программирования №4', 'PRG028', 'Стенд В-6', 'ISN42124X5');

-- Вставка данных о программировании для RB маршрутизаторов (30-32)
INSERT INTO programmers (device_id, ip, place, serial_number, stand, type) VALUES
(@rb1_id, '192.168.1.129', 'Цех программирования №1', 'PRG029', 'Стенд Г-1', 'ISN4200873 +10n'),
(@rb2_id, '192.168.1.130', 'Цех программирования №1', 'PRG030', 'Стенд Г-2', 'ISN4200873 +10n'),
(@rb3_id, '192.168.1.131', 'Цех программирования №1', 'PRG031', 'Стенд Г-3', 'ISN4200873 +10n');

-- Вставка статистики для маршрутизаторов RS (1-13)
INSERT INTO statistic (device_id, date_time, device_type, manufacturer, modification_type, serial_number, stand, status) VALUES
(@rs1_id, '2002-06-15 16:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS101016430001', 'Стенд 1', true),
(@rs2_id, '2003-07-20 16:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS102016430002', 'Стенд 2', true),
(@rs3_id, '2004-03-10 15:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS103016430003', 'Стенд 3', true),
(@rs4_id, '2005-09-25 17:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS104016430004', 'Стенд 4', true),
(@rs5_id, '2006-05-18 16:15:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS105016430005', 'Стенд 5', true),
(@rs6_id, '2007-02-12 14:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS106016430006', 'Стенд 6', true),
(@rs7_id, '2008-08-05 15:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS107016430007', 'Стенд 7', true),
(@rs8_id, '2009-04-15 14:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS108016430008', 'Стенд 8', true),
(@rs9_id, '2010-10-20 16:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS109016430009', 'Стенд 9', true),
(@rs10_id, '2011-01-25 15:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS110016430010', 'Стенд 10', true),
(@rs11_id, '2012-11-30 17:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS111016430011', 'Стенд 11', true),
(@rs12_id, '2013-05-15 16:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS112016430012', 'Стенд 12', true),
(@rs13_id, '2024-05-15 16:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS113016430013', 'Стенд 13', true);

-- Вставка статистики для коммутаторов SA (14-29)
INSERT INTO statistic (device_id, date_time, device_type, manufacturer, modification_type, serial_number, stand, status) VALUES
(@sa1_id, '2023-01-15 16:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430001', 'Стенд А-13', true),
(@sa2_id, '2023-02-20 16:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430002', 'Стенд А-14', true),
(@sa3_id, '2023-03-10 15:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430003', 'Стенд А-15', true),
(@sa4_id, '2023-04-18 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430004', 'Стенд А-16', true),
(@sa5_id, '2023-05-22 16:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430005', 'Стенд А-17', true),
(@sa6_id, '2023-04-05 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430006', 'Стенд Б-5', true),
(@sa7_id, '2023-05-12 16:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430007', 'Стенд Б-6', true),
(@sa8_id, '2023-06-18 17:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430008', 'Стенд Б-7', true),
(@sa9_id, '2023-07-25 16:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430009', 'Стенд Б-8', true),
(@sa10_id, '2023-08-14 17:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430010', 'Стенд Б-9', true),
(@sa11_id, '2023-07-22 16:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430011', 'Стенд В-3', true),
(@sa12_id, '2023-08-30 17:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430012', 'Стенд В-4', true),
(@sa13_id, '2023-09-15 17:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430013', 'Стенд В-5', true),
(@sa14_id, '2024-01-10 16:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430014', 'Стенд А-26', true),
(@sa15_id, '2024-02-15 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430015', 'Стенд Б-10', true),
(@sa16_id, '2025-04-20 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA104026430016', 'Стенд В-6', true);

-- Вставка статистики для RB маршрутизаторов (30-32)
INSERT INTO statistic (device_id, date_time, device_type, manufacturer, modification_type, serial_number, stand, status) VALUES
(@rb1_id, '2021-03-10 16:30:00', 'Граничный маршрутизатор', 'АО НПП Исток', 'ISN4200873 +10n', 'RB101026430001', 'Стенд Г-1', true),
(@rb2_id, '2022-06-20 17:00:00', 'Граничный маршрутизатор', 'АО НПП Исток', 'ISN4200873 +10n', 'RB102026430002', 'Стенд Г-2', true),
(@rb3_id, '2023-09-05 16:45:00', 'Граничный маршрутизатор', 'АО НПП Исток', 'ISN4200873 +10n', 'RB103026430003', 'Стенд Г-3', true);

-- Вставка пользователей
INSERT INTO users (username, password, employee_id, role) VALUES
('admin', 'admin123', 6, 'admin'),
('ivanov_i', '123', 7, 'user'),
('petrov_p', '123', 8, 'user'),
('ivanov_a', '123', 1, 'user'),
('petrov_s', '123', 2, 'user'),
('sidorov_d', '123', 3, 'user'),
('kuznetsov_m', '123', 4, 'user'),
('smirnova_o', '123', 5, 'user'),
('sokolov_a', '123', 9, 'user'),
('mikhailov_d', '123', 10, 'user'),
('novikova_e', '123', 11, 'user'),
('morozov_p', '123', 12, 'user'),
('volkov_n', '123', 13, 'user'),
('kozlov_d', '123', 14, 'user'),
('lebedeva_a', '123', 15, 'user'),
('solovyev_m', '123', 16, 'user'),
('grigoryev_a', '123', 17, 'user'),
('fedorova_e', '123', 18, 'user'),
('nikolaev_s', '123', 19, 'user'),
('alekseeva_t', '123', 20, 'user'),
('orlov_v', '123', 21, 'user'),
('stepanov_a', '123', 22, 'user'),
('makarova_i', '123', 23, 'user'),
('andreev_k', '123', 24, 'user');

-- Добавление истории операций для всех устройств
INSERT INTO history (device_id, commentary, date_time, device_serial_num, file, message) VALUES
(@rs1_id, 'Первоначальная настройка', '2002-06-15 14:30:00', 'RS101016430001', 'config_rs001.txt', 'Устройство успешно сконфигурировано'),
(@rs2_id, 'Обновление прошивки', '2003-07-20 15:00:00', 'RS102016430002', 'firmware_update.log', 'Прошивка обновлена до версии 1.3'),
(@rs3_id, 'Калибровка портов', '2004-03-10 14:45:00', 'RS103016430003', 'calibration.log', 'Калибровка выполнена успешно'),
(@rs4_id, 'Проверка безопасности', '2005-09-25 16:30:00', 'RS104016430004', 'security_check.log', 'Уязвимостей не обнаружено'),
(@rs5_id, 'Настройка VPN', '2006-05-18 15:15:00', 'RS105016430005', 'vpn_config.txt', 'VPN настроен успешно'),
(@rs6_id, 'Мониторинг производительности', '2007-02-12 14:45:00', 'RS106016430006', 'perf_monitor.log', 'Производительность в норме'),
(@rs7_id, 'Обновление ПО', '2008-08-05 16:00:00', 'RS107016430007', 'update_6.4.log', 'Обновление успешно'),
(@rs8_id, 'Настройка маршрутизации', '2009-04-15 15:30:00', 'RS108016430008', 'routing_config.txt', 'Маршруты настроены'),
(@rs9_id, 'Диагностика сети', '2010-10-20 17:15:00', 'RS109016430009', 'network_diag.log', 'Сеть функционирует нормально'),
(@rs10_id, 'Резервное копирование', '2011-01-25 16:45:00', 'RS110016430010', 'backup_config.bin', 'Конфигурация сохранена'),
(@rs11_id, 'Обновление безопасности', '2012-11-30 15:30:00', 'RS111016430011', 'security_update.log', 'Обновление установлено'),
(@rs12_id, 'Плановая проверка', '2013-05-15 17:00:00', 'RS112016430012', 'annual_check.log', 'Все параметры в норме'),
(@rs13_id, 'Первоначальная настройка', '2024-05-15 16:00:00', 'RS113016430013', 'config_rs013.txt', 'Устройство сконфигурировано'),

(@sa1_id, 'Первоначальная настройка PoE', '2023-01-15 15:30:00', 'SA101026430001', 'poe_config.txt', 'PoE сконфигурирован для всех портов'),
(@sa2_id, 'Тестирование производительности', '2023-02-20 16:00:00', 'SA101026430002', 'performance_test.log', 'Пропускная способность в норме'),
(@sa3_id, 'Настройка VLAN', '2023-03-10 15:45:00', 'SA101026430003', 'vlan_config.txt', 'Настроено 32 VLAN'),
(@sa4_id, 'Обновление прошивки', '2023-04-18 17:30:00', 'SA101026430004', 'firmware_update.log', 'Прошивка обновлена'),
(@sa5_id, 'Проверка PoE', '2023-05-22 16:15:00', 'SA101026430005', 'poe_test.log', 'PoE работает корректно'),
(@sa6_id, 'Настройка VLAN', '2023-04-05 17:30:00', 'SA102026430006', 'vlan_config.txt', 'Настроено 16 VLAN'),
(@sa7_id, 'Тестирование портов', '2023-05-12 16:30:00', 'SA102026430007', 'port_test.log', 'Все порты работают'),
(@sa8_id, 'Обновление ПО', '2023-06-18 17:45:00', 'SA102026430008', 'update_4.0.log', 'Обновление до версии 4.0 успешно'),
(@sa9_id, 'Настройка QoS', '2023-07-25 16:00:00', 'SA102026430009', 'qos_config.txt', 'QoS настроен'),
(@sa10_id, 'Проверка безопасности', '2023-08-14 17:30:00', 'SA102026430010', 'security_check.log', 'Безопасность в норме'),
(@sa11_id, 'Настройка агрегации', '2023-07-22 16:45:00', 'SA103026430011', 'lag_config.txt', 'Link aggregation настроен'),
(@sa12_id, 'Мониторинг сети', '2023-08-30 17:15:00', 'SA103026430012', 'monitoring.log', 'Сеть стабильна'),
(@sa13_id, 'Обновление драйверов', '2023-09-15 16:30:00', 'SA103026430013', 'driver_update.log', 'Драйверы обновлены'),
(@sa14_id, 'Первоначальная настройка', '2024-01-10 16:30:00', 'SA101026430014', 'initial_config.txt', 'Устройство готово к работе'),
(@sa15_id, 'Тестирование PoE', '2024-02-15 17:15:00', 'SA102026430015', 'poe_test.log', 'PoE функционирует'),
(@sa16_id, 'Первоначальная настройка', '2025-04-20 16:00:00', 'SA104026430016', 'initial_config.txt', 'Устройство готово к работе'),

(@rb1_id, 'Настройка BGP', '2021-03-10 16:30:00', 'RB101026430001', 'bgp_config.txt', 'BGP настроен'),
(@rb2_id, 'Обновление прошивки', '2022-06-20 17:00:00', 'RB102026430002', 'firmware_update.log', 'Прошивка обновлена'),
(@rb3_id, 'Проверка маршрутизации', '2023-09-05 16:45:00', 'RB103026430003', 'routing_check.log', 'Маршрутизация работает');

-- Добавление информации о ремонтах
INSERT INTO repair (device_id, date_time, date_time_repair, device_serial_num, message) VALUES
(@rs3_id, '2005-06-10 10:00:00', '2005-06-12 14:00:00', 'RS103016430003', 'Замена блока питания'),
(@rs5_id, '2008-03-15 11:30:00', '2008-03-16 16:30:00', 'RS105016430005', 'Профилактическое обслуживание'),
(@rs11_id, '2014-05-20 09:00:00', '2014-05-21 13:00:00', 'RS111016430011', 'Замена вентилятора'),
(@sa7_id, '2023-08-01 09:00:00', '2023-08-02 13:00:00', 'SA102026430007', 'Калибровка PoE портов'),
(@sa12_id, '2023-11-10 10:30:00', '2023-11-11 15:30:00', 'SA103026430012', 'Замена блока питания'),
(@rb2_id, '2023-12-05 11:00:00', '2023-12-06 16:00:00', 'RB102026430002', 'Профилактическое обслуживание'),
(@sa15_id, '2024-03-15 10:00:00', '2024-03-16 14:00:00', 'SA102026430015', 'Калибровка PoE'),
(@rs13_id, '2024-06-10 09:00:00', '2024-06-11 13:00:00', 'RS113016430013', 'Профилактическое обслуживание');

-- Добавление ошибок устройств
INSERT INTO device_error (device_id, date, debug_info, error_code, ip, serial_num, stand, status) VALUES
(@rs3_id, '2005-06-10', 'Power supply failure', 'ERR-001', '192.168.1.103', 'RS103016430003', 'Стенд 3', false),
(@rs5_id, '2008-03-15', 'Overheating warning', 'ERR-002', '192.168.1.105', 'RS105016430005', 'Стенд 5', true),
(@rs11_id, '2014-05-20', 'Fan failure', 'ERR-003', '192.168.1.111', 'RS111016430011', 'Стенд 11', false),
(@sa7_id, '2023-08-01', 'PoE port 5 overcurrent', 'ERR-023', '192.168.1.119', 'SA102026430007', 'Стенд Б-6', true),
(@sa12_id, '2023-11-10', 'Power supply fluctuation', 'ERR-031', '192.168.1.124', 'SA103026430012', 'Стенд В-4', false),
(@rb2_id, '2023-12-05', 'High temperature warning', 'ERR-045', '192.168.1.129', 'RB102026430002', 'Стенд Г-2', true),
(@sa3_id, '2023-06-15', 'Port 12 link down', 'ERR-012', '192.168.1.115', 'SA101026430003', 'Стенд А-15', true),
(@sa10_id, '2023-09-20', 'Memory usage high', 'ERR-078', '192.168.1.122', 'SA102026430010', 'Стенд Б-9', true),
(@sa15_id, '2024-03-10', 'PoE port 3 overcurrent', 'ERR-089', '192.168.1.127', 'SA102026430015', 'Стенд Б-10', true);

-- Добавление Xray данных
INSERT INTO xray (device_id, file, serial_num) VALUES
(@rs1_id, 'xray_rs001_2002.jpg', 'XR00123001'),
(@rs2_id, 'xray_rs002_2003.jpg', 'XR00123002'),
(@rs3_id, 'xray_rs003_2004.jpg', 'XR00123003'),
(@rs4_id, 'xray_rs004_2005.jpg', 'XR00123004'),
(@rs5_id, 'xray_rs005_2006.jpg', 'XR00123005'),
(@rs6_id, 'xray_rs006_2007.jpg', 'XR00123006'),
(@rs7_id, 'xray_rs007_2008.jpg', 'XR00123007'),
(@rs8_id, 'xray_rs008_2009.jpg', 'XR00123008'),
(@rs9_id, 'xray_rs009_2010.jpg', 'XR00123009'),
(@rs10_id, 'xray_rs010_2011.jpg', 'XR00123010'),
(@rs11_id, 'xray_rs011_2012.jpg', 'XR00123011'),
(@rs12_id, 'xray_rs012_2013.jpg', 'XR00123012'),
(@rs13_id, 'xray_rs013_2024.jpg', 'XR00123013'),
(@sa1_id, 'xray_sa001_2023.jpg', 'XR00223001'),
(@sa2_id, 'xray_sa002_2023.jpg', 'XR00223002'),
(@sa3_id, 'xray_sa003_2023.jpg', 'XR00223003'),
(@sa4_id, 'xray_sa004_2023.jpg', 'XR00223004'),
(@sa5_id, 'xray_sa005_2023.jpg', 'XR00223005'),
(@sa6_id, 'xray_sa006_2023.jpg', 'XR00223006'),
(@sa7_id, 'xray_sa007_2023.jpg', 'XR00223007'),
(@sa8_id, 'xray_sa008_2023.jpg', 'XR00223008'),
(@sa9_id, 'xray_sa009_2023.jpg', 'XR00223009'),
(@sa10_id, 'xray_sa010_2023.jpg', 'XR00223010'),
(@sa11_id, 'xray_sa011_2023.jpg', 'XR00223011'),
(@sa12_id, 'xray_sa012_2023.jpg', 'XR00223012'),
(@sa13_id, 'xray_sa013_2023.jpg', 'XR00223013'),
(@sa14_id, 'xray_sa014_2024.jpg', 'XR00223014'),
(@sa15_id, 'xray_sa015_2024.jpg', 'XR00223015'),
(@sa16_id, 'xray_sa016_2025.jpg', 'XR00223016'),
(@rb1_id, 'xray_rb001_2021.jpg', 'XR00323001'),
(@rb2_id, 'xray_rb002_2022.jpg', 'XR00323002'),
(@rb3_id, 'xray_rb003_2023.jpg', 'XR00323003');

-- Вывод информации о количестве добавленных записей
SELECT 'БД успешно создана и заполнена!' as 'Статус';
SELECT COUNT(*) as 'Всего устройств' FROM devices;
SELECT COUNT(*) as 'Маршрутизаторов RS' FROM devices WHERE device_type_id = @device_type_rs_id;
SELECT COUNT(*) as 'Маршрутизаторов RB' FROM devices WHERE device_type_id = @device_type_rb_id;
SELECT COUNT(*) as 'Коммутаторов доступа' FROM devices WHERE device_type_id = @device_type_sa_id;
SELECT COUNT(*) as 'Всего сотрудников' FROM employees;
SELECT COUNT(*) as 'MAC-адресов' FROM macs;
SELECT COUNT(*) as 'Серийных номеров плат' FROM serial_num_board;
SELECT COUNT(*) as 'Записей о сборке' FROM assemblers;
SELECT COUNT(*) as 'Записей о диагностике' FROM electricians;
SELECT COUNT(*) as 'Записей о ПСИ' FROM psi_tests;
SELECT COUNT(*) as 'Записей о программировании' FROM programmers;
SELECT COUNT(*) as 'Записей статистики' FROM statistic;
SELECT COUNT(*) as 'Записей истории' FROM history;
SELECT COUNT(*) as 'Записей о ремонтах' FROM repair;
SELECT COUNT(*) as 'Записей об ошибках' FROM device_error;
SELECT COUNT(*) as 'Xray снимков' FROM xray;
SELECT COUNT(*) as 'Пользователей' FROM users;

-- Дополнительная проверка заполненности всех таблиц
SELECT 'Проверка заполненности всех таблиц:' as ' ';
SELECT 'device_type' as table_name, COUNT(*) as records FROM device_type
UNION ALL
SELECT 'place_of_production', COUNT(*) FROM place_of_production
UNION ALL
SELECT 'production_month', COUNT(*) FROM production_month
UNION ALL
SELECT 'production_year', COUNT(*) FROM production_year
UNION ALL
SELECT 'production_stage', COUNT(*) FROM production_stage
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'location', COUNT(*) FROM location
UNION ALL
SELECT 'bmc', COUNT(*) FROM bmc
UNION ALL
SELECT 'uboot', COUNT(*) FROM uboot
UNION ALL
SELECT 'iso', COUNT(*) FROM iso
UNION ALL
SELECT 'devices', COUNT(*) FROM devices
UNION ALL
SELECT 'macs', COUNT(*) FROM macs
UNION ALL
SELECT 'serial_num_board', COUNT(*) FROM serial_num_board
UNION ALL
SELECT 'serial_num_pcb', COUNT(*) FROM serial_num_pcb
UNION ALL
SELECT 'serial_num_router', COUNT(*) FROM serial_num_router
UNION ALL
SELECT 'serial_num_pki', COUNT(*) FROM serial_num_pki
UNION ALL
SELECT 'serial_num_bp', COUNT(*) FROM serial_num_bp
UNION ALL
SELECT 'serial_num_package', COUNT(*) FROM serial_num_package
UNION ALL
SELECT 'serial_num_case', COUNT(*) FROM serial_num_case
UNION ALL
SELECT 'assemblers', COUNT(*) FROM assemblers
UNION ALL
SELECT 'electricians', COUNT(*) FROM electricians
UNION ALL
SELECT 'psi_tests', COUNT(*) FROM psi_tests
UNION ALL
SELECT 'programmers', COUNT(*) FROM programmers
UNION ALL
SELECT 'xray', COUNT(*) FROM xray
UNION ALL
SELECT 'statistic', COUNT(*) FROM statistic
UNION ALL
SELECT 'history', COUNT(*) FROM history
UNION ALL
SELECT 'device_error', COUNT(*) FROM device_error
UNION ALL
SELECT 'repair', COUNT(*) FROM repair
UNION ALL
SELECT 'users', COUNT(*) FROM users
ORDER BY table_name;