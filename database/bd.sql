-- Создание базы данных
CREATE DATABASE IF NOT EXISTS istok;
USE istok;

-- Отключение проверки внешних ключей временно
SET FOREIGN_KEY_CHECKS = 0;

-- Удаление существующих таблиц (если нужно пересоздать)
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
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE location (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE bmc (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_bmc VARCHAR(255),
    version_bmc VARCHAR(255) UNIQUE
);

CREATE TABLE uboot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_uboot VARCHAR(255),
    version_uboot VARCHAR(255) UNIQUE
);

CREATE TABLE iso (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_iso VARCHAR(255),
    version_iso VARCHAR(255) UNIQUE
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

-- Включение проверки внешних ключей
SET FOREIGN_KEY_CHECKS = 1;

-- ===== ВСТАВКА ДАННЫХ В СПРАВОЧНЫЕ ТАБЛИЦЫ =====
-- Только нужные типы устройств: Сервисный маршрутизатор (RS) и Коммутатор доступа (SA)
INSERT INTO device_type (name, code) VALUES
('Сервисный маршрутизатор', 'RS'),
('Коммутатор доступа', 'SA');

INSERT INTO production_month (code, name) VALUES
('1', 'Январь'), ('2', 'Февраль'), ('3', 'Март'), ('4', 'Апрель'), 
('5', 'Май'), ('6', 'Июнь'), ('7', 'Июль'), ('8', 'Август'), 
('9', 'Сентябрь'), ('10', 'Октябрь'), ('11', 'Ноябрь'), ('12', 'Декабрь');

INSERT INTO production_year (code, name) VALUES
('1', '2002'), ('2', '2003'), ('3', '2004'), ('4', '2005'), ('5', '2006'),
('6', '2007'), ('7', '2008'), ('8', '2009'), ('9', '2010'), ('10', '2011'),
('11', '2012'), ('12', '2013'), ('13', '2014'), ('14', '2015'), ('15', '2016'),
('16', '2017'), ('17', '2018'), ('18', '2019'), ('19', '2020'), ('20', '2021'),
('21', '2022'), ('22', '2023'), ('23', '2024'), ('24', '2025');

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
('18', 'АО НПП Исток Цех №7');

INSERT INTO location (name) VALUES
('Склад готовой продукции'), 
('Цех сборки №1'), 
('Цех диагностики'), 
('Лаборатория ПСИ'), 
('Упаковочный цех'),
('Цех программирования №2'),
('Цех программирования №3'),
('Цех программирования №4');

-- Вставка BMC
INSERT INTO bmc (file_bmc, version_bmc) VALUES
('bmc_router_v1.2.bin', 'router_1.2'), 
('bmc_router_v1.3.bin', 'router_1.3'), 
('bmc_router_v1.4.bin', 'router_1.4'),
('bmc_router_v1.5.bin', 'router_1.5'), 
('bmc_router_v2.0.bin', 'router_2.0'),
('bmc_switch_v1.0.bin', 'switch_1.0'),
('bmc_switch_v1.1.bin', 'switch_1.1'),
('bmc_switch_v2.0.bin', 'switch_2.0'),
('bmc_switch_v2.1.bin', 'switch_2.1');

-- Вставка UBOOT
INSERT INTO uboot (file_uboot, version_uboot) VALUES
('uboot_router_v2022.01', 'router_2022.01'), 
('uboot_router_v2022.04', 'router_2022.04'), 
('uboot_router_v2023.01', 'router_2023.01'), 
('uboot_router_v2023.04', 'router_2023.04'),
('uboot_switch_v2023.01', 'switch_2023.01'),
('uboot_switch_v2023.06', 'switch_2023.06'),
('uboot_switch_v2024.01', 'switch_2024.01');

-- Вставка ISO
INSERT INTO iso (file_iso, version_iso) VALUES
('routeros_6.0.iso', 'router_6.0'), 
('routeros_6.1.iso', 'router_6.1'), 
('routeros_6.2.iso', 'router_6.2'), 
('routeros_6.3.iso', 'router_6.3'), 
('routeros_6.4.iso', 'router_6.4'),
('switch_os_3.0.iso', 'switch_3.0'),
('switch_os_3.1.iso', 'switch_3.1'),
('switch_os_3.2.iso', 'switch_3.2'),
('switch_os_4.0.iso', 'switch_4.0');

-- Вставка сотрудников
INSERT INTO employees (last_name, first_name, middle_name, position, username, password, role) VALUES
-- Основные сотрудники
('Иванов', 'Алексей', 'Петрович', 'Сборщик', 'ivanov_a', '123', 'user'),
('Петров', 'Сергей', 'Иванович', 'Сборщик', 'petrov_s', '123', 'user'),
('Сидоров', 'Дмитрий', 'Васильевич', 'Электрик', 'sidorov_d', '123', 'user'),
('Кузнецов', 'Михаил', 'Александрович', 'Электрик', 'kuznetsov_m', '123', 'user'),
('Смирнова', 'Ольга', 'Викторовна', 'Инженер ПСИ', 'smirnova_o', '123', 'user'),
-- Администраторы
('Администратор', 'Главный', 'Системович', 'Главный администратор', 'admin', 'admin123', 'admin'),
('Иванов', 'Иван', 'Иванович', 'Инженер', 'ivanov_i', '123', 'user'),
('Петров', 'Петр', 'Петрович', 'Техник', 'petrov_p', '123', 'user'),
-- Сотрудники для коммутаторов
('Соколов', 'Андрей', 'Викторович', 'Сборщик коммутаторов', 'sokolov_a', '123', 'user'),
('Михайлов', 'Денис', 'Сергеевич', 'Сборщик коммутаторов', 'mikhailov_d', '123', 'user'),
('Новикова', 'Елена', 'Александровна', 'Электрик', 'novikova_e', '123', 'user'),
('Морозов', 'Павел', 'Игоревич', 'Инженер ПСИ', 'morozov_p', '123', 'user'),
('Волков', 'Николай', 'Петрович', 'Тестировщик', 'volkov_n', '123', 'user'),
-- Операторы
('Оператор', 'Иван', 'Петрович', 'Оператор', 'operator', '123', 'operator'),
('Петрова', 'Анна', 'Сергеевна', 'Старший оператор', 'operator2', '123', 'operator');

-- ===== ВСТАВКА УСТРОЙСТВ =====
-- RS маршрутизаторы (серия ISN415)
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '10'), 
 (SELECT id FROM production_month WHERE code = '6'), 
 (SELECT id FROM production_year WHERE code = '1'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_1.2'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2022.01'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.0'),
 'RS101016430001', '001', '2002-06-15', 'ISN4150873 +10n',
 'RouterOS 6.0', true, '2002-06-15 10:00:00', '2002-06-15 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '12'), 
 (SELECT id FROM production_month WHERE code = '7'), 
 (SELECT id FROM production_year WHERE code = '2'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_1.3'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2022.04'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.1'),
 'RS102016430002', '002', '2003-07-20', 'ISN4150873 +10n',
 'RouterOS 6.1', true, '2003-07-20 10:00:00', '2003-07-20 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '13'), 
 (SELECT id FROM production_month WHERE code = '3'), 
 (SELECT id FROM production_year WHERE code = '3'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_1.4'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2023.01'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.2'),
 'RS103016430003', '003', '2004-03-10', 'ISN4150873 +10n',
 'RouterOS 6.2', true, '2004-03-10 10:00:00', '2004-03-10 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '14'), 
 (SELECT id FROM production_month WHERE code = '9'), 
 (SELECT id FROM production_year WHERE code = '4'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_1.5'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2023.04'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.3'),
 'RS104016430004', '004', '2005-09-25', 'ISN4150873 +10n',
 'RouterOS 6.3', true, '2005-09-25 10:00:00', '2005-09-25 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '5'), 
 (SELECT id FROM production_year WHERE code = '5'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2022.01'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.4'),
 'RS105016430005', '005', '2006-05-18', 'ISN4150873 +10n',
 'RouterOS 6.4', true, '2006-05-18 10:00:00', '2006-05-18 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '10'), 
 (SELECT id FROM production_month WHERE code = '2'), 
 (SELECT id FROM production_year WHERE code = '6'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2023.04'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.4'),
 'RS106016430006', '006', '2007-02-12', 'ISN4150873 +10n',
 'RouterOS 6.4', true, '2007-02-12 10:00:00', '2007-02-12 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '12'), 
 (SELECT id FROM production_month WHERE code = '8'), 
 (SELECT id FROM production_year WHERE code = '7'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2023.01'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.3'),
 'RS107016430007', '007', '2008-08-05', 'ISN4150873 +10n',
 'RouterOS 6.3', true, '2008-08-05 10:00:00', '2008-08-05 14:00:00'),

-- RS маршрутизаторы серии ISN505
((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '1'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2023.01'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.4'),
 'RS108026430008', '008', '2023-01-15', 'ISN50502T5',
 'RouterOS 6.4', true, '2023-01-15 10:00:00', '2023-01-15 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '3'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2023.04'), 
 (SELECT id FROM iso WHERE version_iso = 'router_6.4'),
 'RS109026430009', '009', '2023-03-20', 'ISN50502T5',
 'RouterOS 6.4', true, '2023-03-20 10:00:00', '2023-03-20 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '6'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = 'router_2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'router_2024.01'), 
 (SELECT id FROM iso WHERE version_iso = 'router_7.0'),
 'RS110026430010', '010', '2023-06-10', 'ISN50502T5',
 'RouterOS 7.0', true, '2023-06-10 10:00:00', '2023-06-10 14:00:00');

-- SA коммутаторы доступа
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '1'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_1.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2023.01'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_3.0'),
 'SA101026430001', '001', '2023-01-15', 'ISN42124T5C4',
 'SwitchOS 3.0', true, '2023-01-15 10:00:00', '2023-01-15 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '2'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_1.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2023.01'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_3.0'),
 'SA101026430002', '002', '2023-02-20', 'ISN42124T5C4',
 'SwitchOS 3.0', true, '2023-02-20 10:00:00', '2023-02-20 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '3'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_1.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2023.06'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_3.1'),
 'SA101026430003', '003', '2023-03-10', 'ISN42124T5C4',
 'SwitchOS 3.1', true, '2023-03-10 10:00:00', '2023-03-10 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '4'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2023.06'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_3.1'),
 'SA102026430004', '004', '2023-04-05', 'ISN42124T5P5',
 'SwitchOS 3.1', true, '2023-04-05 10:00:00', '2023-04-05 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '5'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2023.06'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_3.2'),
 'SA102026430005', '005', '2023-05-12', 'ISN42124T5P5',
 'SwitchOS 3.2', true, '2023-05-12 10:00:00', '2023-05-12 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '6'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2024.01'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_4.0'),
 'SA102026430006', '006', '2023-06-18', 'ISN42124T5P5',
 'SwitchOS 4.0', true, '2023-06-18 10:00:00', '2023-06-18 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '7'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2024.01'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_4.0'),
 'SA103026430007', '007', '2023-07-22', 'ISN42124X5',
 'SwitchOS 4.0', true, '2023-07-22 10:00:00', '2023-07-22 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '8'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2024.01'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_4.0'),
 'SA103026430008', '008', '2023-08-30', 'ISN42124X5',
 'SwitchOS 4.0', true, '2023-08-30 10:00:00', '2023-08-30 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '1'), 
 (SELECT id FROM production_year WHERE code = '23'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2024.01'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_4.0'),
 'SA101026430009', '009', '2024-01-10', 'ISN42124T5C4',
 'SwitchOS 4.0', true, '2024-01-10 10:00:00', '2024-01-10 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '2'), 
 (SELECT id FROM production_year WHERE code = '23'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = 'switch_2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = 'switch_2024.01'), 
 (SELECT id FROM iso WHERE version_iso = 'switch_4.0'),
 'SA102026430010', '010', '2024-02-15', 'ISN42124T5P5',
 'SwitchOS 4.0', true, '2024-02-15 10:00:00', '2024-02-15 14:00:00');

-- ===== ВСТАВКА MAC-АДРЕСОВ =====
-- MAC-адреса для RS маршрутизаторов
INSERT INTO macs (device_id, mac_address, interface_name, assignment_date) VALUES
(1, '00:1B:44:11:3A:B7', 'eth0', '2002-06-15'),
(1, '00:1B:44:11:3A:B8', 'eth1', '2002-06-15'),
(2, '00:1B:44:11:3A:B9', 'eth0', '2003-07-20'),
(2, '00:1B:44:11:3A:BA', 'eth1', '2003-07-20'),
(3, '00:1B:44:11:3A:BB', 'eth0', '2004-03-10'),
(3, '00:1B:44:11:3A:BC', 'eth1', '2004-03-10'),
(4, '00:1B:44:11:3A:BD', 'eth0', '2005-09-25'),
(4, '00:1B:44:11:3A:BE', 'eth1', '2005-09-25'),
(5, '00:1B:44:11:3A:BF', 'eth0', '2006-05-18'),
(5, '00:1B:44:11:3A:C0', 'eth1', '2006-05-18'),
(6, '00:1B:44:11:3A:C1', 'eth0', '2007-02-12'),
(6, '00:1B:44:11:3A:C2', 'eth1', '2007-02-12'),
(7, '00:1B:44:11:3A:C3', 'eth0', '2008-08-05'),
(7, '00:1B:44:11:3A:C4', 'eth1', '2008-08-05'),
(8, '00:1B:44:11:3A:C5', 'eth0', '2023-01-15'),
(8, '00:1B:44:11:3A:C6', 'eth1', '2023-01-15'),
(9, '00:1B:44:11:3A:C7', 'eth0', '2023-03-20'),
(9, '00:1B:44:11:3A:C8', 'eth1', '2023-03-20'),
(10, '00:1B:44:11:3A:C9', 'eth0', '2023-06-10'),
(10, '00:1B:44:11:3A:D0', 'eth1', '2023-06-10');

-- MAC-адреса для SA коммутаторов
INSERT INTO macs (device_id, mac_address, interface_name, assignment_date) VALUES
(11, '00:1C:44:11:3A:D1', 'eth0', '2023-01-15'),
(11, '00:1C:44:11:3A:D2', 'eth1', '2023-01-15'),
(11, '00:1C:44:11:3A:D3', 'management', '2023-01-15'),
(12, '00:1C:44:11:3A:E1', 'eth0', '2023-02-20'),
(12, '00:1C:44:11:3A:E2', 'eth1', '2023-02-20'),
(12, '00:1C:44:11:3A:E3', 'management', '2023-02-20'),
(13, '00:1C:44:11:3A:F1', 'eth0', '2023-03-10'),
(13, '00:1C:44:11:3A:F2', 'eth1', '2023-03-10'),
(13, '00:1C:44:11:3A:F3', 'management', '2023-03-10'),
(14, '00:1C:44:11:3A:G1', 'eth0', '2023-04-05'),
(14, '00:1C:44:11:3A:G2', 'eth1', '2023-04-05'),
(14, '00:1C:44:11:3A:G3', 'management', '2023-04-05'),
(15, '00:1C:44:11:3A:H1', 'eth0', '2023-05-12'),
(15, '00:1C:44:11:3A:H2', 'eth1', '2023-05-12'),
(15, '00:1C:44:11:3A:H3', 'management', '2023-05-12'),
(16, '00:1C:44:11:3A:I1', 'eth0', '2023-06-18'),
(16, '00:1C:44:11:3A:I2', 'eth1', '2023-06-18'),
(16, '00:1C:44:11:3A:I3', 'management', '2023-06-18'),
(17, '00:1C:44:11:3A:J1', 'eth0', '2023-07-22'),
(17, '00:1C:44:11:3A:J2', 'eth1', '2023-07-22'),
(17, '00:1C:44:11:3A:J3', 'management', '2023-07-22'),
(18, '00:1C:44:11:3A:K1', 'eth0', '2023-08-30'),
(18, '00:1C:44:11:3A:K2', 'eth1', '2023-08-30'),
(18, '00:1C:44:11:3A:K3', 'management', '2023-08-30'),
(19, '00:1C:44:11:3A:L1', 'eth0', '2024-01-10'),
(19, '00:1C:44:11:3A:L2', 'eth1', '2024-01-10'),
(19, '00:1C:44:11:3A:L3', 'management', '2024-01-10'),
(20, '00:1C:44:11:3A:M1', 'eth0', '2024-02-15'),
(20, '00:1C:44:11:3A:M2', 'eth1', '2024-02-15'),
(20, '00:1C:44:11:3A:M3', 'management', '2024-02-15');

-- ===== СЕРИЙНЫЕ НОМЕРА ДЛЯ RS МАРШРУТИЗАТОРОВ =====
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(1, 'SNB00123001', true, 'Иванов А.П.', '2002-06-10 10:00:00'),
(2, 'SNB00123002', true, 'Петров С.И.', '2003-07-15 11:30:00'),
(3, 'SNB00123003', true, 'Иванов А.П.', '2004-03-05 09:45:00'),
(4, 'SNB00123004', true, 'Петров С.И.', '2005-09-20 14:20:00'),
(5, 'SNB00123005', true, 'Иванов А.П.', '2006-05-12 16:10:00'),
(6, 'SNB00123006', true, 'Петров С.И.', '2007-02-10 10:30:00'),
(7, 'SNB00123007', true, 'Иванов А.П.', '2008-08-03 13:15:00'),
(8, 'SNB00123008', true, 'Соколов А.В.', '2023-01-14 09:30:00'),
(9, 'SNB00123009', true, 'Михайлов Д.С.', '2023-03-19 10:15:00'),
(10, 'SNB00123010', true, 'Соколов А.В.', '2023-06-09 11:45:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(1, 'PCBSN00123001'), (2, 'PCBSN00123002'), (3, 'PCBSN00123003'),
(4, 'PCBSN00123004'), (5, 'PCBSN00123005'), (6, 'PCBSN00123006'),
(7, 'PCBSN00123007'), (8, 'PCBSN00123008'), (9, 'PCBSN00123009'),
(10, 'PCBSN00123010');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(1, 'ROUTER00123001'), (2, 'ROUTER00123002'), (3, 'ROUTER00123003'),
(4, 'ROUTER00123004'), (5, 'ROUTER00123005'), (6, 'ROUTER00123006'),
(7, 'ROUTER00123007'), (8, 'ROUTER00123008'), (9, 'ROUTER00123009'),
(10, 'ROUTER00123010');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(1, 'PKG00123001'), (2, 'PKG00123002'), (3, 'PKG00123003'),
(4, 'PKG00123004'), (5, 'PKG00123005'), (6, 'PKG00123006'),
(7, 'PKG00123007'), (8, 'PKG00123008'), (9, 'PKG00123009'),
(10, 'PKG00123010');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(1, 'CASE00123001'), (2, 'CASE00123002'), (3, 'CASE00123003'),
(4, 'CASE00123004'), (5, 'CASE00123005'), (6, 'CASE00123006'),
(7, 'CASE00123007'), (8, 'CASE00123008'), (9, 'CASE00123009'),
(10, 'CASE00123010');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(1, 'BP00123001'), (2, 'BP00123002'), (3, 'BP00123003'),
(4, 'BP00123004'), (5, 'BP00123005'), (6, 'BP00123006'),
(7, 'BP00123007'), (8, 'BP00123008'), (9, 'BP00123009'),
(10, 'BP00123010');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(1, 'PKI00123001'), (2, 'PKI00123002'), (3, 'PKI00123003'),
(4, 'PKI00123004'), (5, 'PKI00123005'), (6, 'PKI00123006'),
(7, 'PKI00123007'), (8, 'PKI00123008'), (9, 'PKI00123009'),
(10, 'PKI00123010');

-- ===== СЕРИЙНЫЕ НОМЕРА ДЛЯ SA КОММУТАТОРОВ =====
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(11, 'SNB00223001', true, 'Соколов А.В.', '2023-01-14 09:30:00'),
(12, 'SNB00223002', true, 'Михайлов Д.С.', '2023-02-19 10:15:00'),
(13, 'SNB00223003', true, 'Соколов А.В.', '2023-03-09 11:45:00'),
(14, 'SNB00223004', true, 'Михайлов Д.С.', '2023-04-04 13:20:00'),
(15, 'SNB00223005', true, 'Соколов А.В.', '2023-05-11 14:30:00'),
(16, 'SNB00223006', true, 'Михайлов Д.С.', '2023-06-17 15:45:00'),
(17, 'SNB00223007', true, 'Соколов А.В.', '2023-07-21 10:00:00'),
(18, 'SNB00223008', true, 'Михайлов Д.С.', '2023-08-29 16:20:00'),
(19, 'SNB00223009', true, 'Соколов А.В.', '2024-01-09 11:00:00'),
(20, 'SNB00223010', true, 'Михайлов Д.С.', '2024-02-14 14:30:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(11, 'PCBSN00223001'), (12, 'PCBSN00223002'), (13, 'PCBSN00223003'),
(14, 'PCBSN00223004'), (15, 'PCBSN00223005'), (16, 'PCBSN00223006'),
(17, 'PCBSN00223007'), (18, 'PCBSN00223008'), (19, 'PCBSN00223009'),
(20, 'PCBSN00223010');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(11, 'SWRTR00223001'), (12, 'SWRTR00223002'), (13, 'SWRTR00223003'),
(14, 'SWRTR00223004'), (15, 'SWRTR00223005'), (16, 'SWRTR00223006'),
(17, 'SWRTR00223007'), (18, 'SWRTR00223008'), (19, 'SWRTR00223009'),
(20, 'SWRTR00223010');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(11, 'PKG00223001'), (12, 'PKG00223002'), (13, 'PKG00223003'),
(14, 'PKG00223004'), (15, 'PKG00223005'), (16, 'PKG00223006'),
(17, 'PKG00223007'), (18, 'PKG00223008'), (19, 'PKG00223009'),
(20, 'PKG00223010');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(11, 'CASE00223001'), (12, 'CASE00223002'), (13, 'CASE00223003'),
(14, 'CASE00223004'), (15, 'CASE00223005'), (16, 'CASE00223006'),
(17, 'CASE00223007'), (18, 'CASE00223008'), (19, 'CASE00223009'),
(20, 'CASE00223010');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(11, 'BP00223001'), (12, 'BP00223002'), (13, 'BP00223003'),
(14, 'BP00223004'), (15, 'BP00223005'), (16, 'BP00223006'),
(17, 'BP00223007'), (18, 'BP00223008'), (19, 'BP00223009'),
(20, 'BP00223010');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(11, 'PKI00223001'), (12, 'PKI00223002'), (13, 'PKI00223003'),
(14, 'PKI00223004'), (15, 'PKI00223005'), (16, 'PKI00223006'),
(17, 'PKI00223007'), (18, 'PKI00223008'), (19, 'PKI00223009'),
(20, 'PKI00223010');

-- Обновление внешних ключей для устройств
-- Обновляем для RS маршрутизаторов (1-10)
UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 1 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 1 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 1 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 1)
WHERE id = 1;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 2 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 2 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 2 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 2),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 2),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 2),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 2),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 2),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 2),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 2)
WHERE id = 2;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 3 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 3 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 3 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 3),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 3),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 3),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 3),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 3),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 3),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 3)
WHERE id = 3;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 4 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 4 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 4 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 4),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 4),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 4),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 4),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 4),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 4),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 4)
WHERE id = 4;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 5 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 5 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 5 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 5),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 5),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 5),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 5),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 5),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 5),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 5)
WHERE id = 5;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 6 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 6 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 6 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 6),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 6),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 6),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 6),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 6),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 6),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 6)
WHERE id = 6;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 7 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 7 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 7 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 7),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 7),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 7),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 7),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 7),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 7),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 7)
WHERE id = 7;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 8 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 8 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 8 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 8),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 8),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 8),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 8),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 8),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 8),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 8)
WHERE id = 8;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 9 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 9 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 9 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 9),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 9),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 9),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 9),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 9),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 9),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 9)
WHERE id = 9;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 10 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 10 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 10 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 10),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 10),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 10),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 10),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 10),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 10),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 10)
WHERE id = 10;

-- Обновляем для SA коммутаторов (11-20) с management интерфейсом
UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 11 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 11 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 11 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 11),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 11),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 11),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 11),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 11),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 11),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 11)
WHERE id = 11;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 12 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 12 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 12 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 12),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 12),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 12),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 12),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 12),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 12),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 12)
WHERE id = 12;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 13 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 13 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 13 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 13),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 13),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 13),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 13),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 13),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 13),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 13)
WHERE id = 13;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 14 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 14 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 14 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 14),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 14),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 14),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 14),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 14),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 14),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 14)
WHERE id = 14;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 15 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 15 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 15 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 15),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 15),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 15),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 15),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 15),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 15),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 15)
WHERE id = 15;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 16 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 16 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 16 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 16),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 16),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 16),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 16),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 16),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 16),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 16)
WHERE id = 16;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 17 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 17 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 17 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 17),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 17),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 17),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 17),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 17),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 17),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 17)
WHERE id = 17;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 18 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 18 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 18 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 18),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 18),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 18),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 18),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 18),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 18),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 18)
WHERE id = 18;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 19 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 19 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 19 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 19),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 19),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 19),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 19),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 19),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 19),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 19)
WHERE id = 19;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 20 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 20 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 20 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 20),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 20),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 20),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 20),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 20),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 20),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 20)
WHERE id = 20;

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

-- Вставка данных о сборке
INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(1, 1, '2002-06-12'), (2, 2, '2003-07-17'), (1, 3, '2004-03-07'),
(2, 4, '2005-09-22'), (1, 5, '2006-05-15'), (2, 6, '2007-02-10'),
(1, 7, '2008-08-03'), (9, 8, '2023-01-14'), (10, 9, '2023-03-19'),
(9, 10, '2023-06-09'), (9, 11, '2023-01-14'), (10, 12, '2023-02-19'),
(9, 13, '2023-03-09'), (10, 14, '2023-04-04'), (9, 15, '2023-05-11'),
(10, 16, '2023-06-17'), (9, 17, '2023-07-21'), (10, 18, '2023-08-29'),
(9, 19, '2024-01-09'), (10, 20, '2024-02-14');

-- Вставка данных о диагностике
INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(3, 1, '2002-06-13', 'Диагностика пройдена успешно'),
(4, 2, '2003-07-18', 'Все системы функционируют нормально'),
(3, 3, '2004-03-08', 'Диагностика без замечаний'),
(4, 4, '2005-09-23', 'Оборудование соответствует ТУ'),
(3, 5, '2006-05-16', 'Диагностика пройдена'),
(4, 6, '2007-02-11', 'Все параметры в норме'),
(3, 7, '2008-08-04', 'Диагностика успешна'),
(11, 8, '2023-01-14', 'Диагностика успешно пройдена'),
(11, 9, '2023-03-19', 'Все системы функционируют нормально'),
(11, 10, '2023-06-09', 'Диагностика без замечаний'),
(11, 11, '2023-01-14', 'Диагностика успешно пройдена, PoE работает корректно'),
(11, 12, '2023-02-19', 'Все порты функционируют нормально'),
(11, 13, '2023-03-09', 'Диагностика без замечаний, температура в норме'),
(11, 14, '2023-04-04', 'PoE питание в норме, коммутатор готов к работе'),
(11, 15, '2023-05-11', 'Все системы функционируют нормально'),
(11, 16, '2023-06-17', 'Диагностика пройдена успешно'),
(11, 17, '2023-07-21', 'Соответствует техническим условиям'),
(11, 18, '2023-08-29', 'Диагностика пройдена, ошибок не обнаружено'),
(11, 19, '2024-01-09', 'PoE функционирует корректно'),
(11, 20, '2024-02-14', 'Диагностика успешна');

-- Вставка данных о ПСИ
INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(5, 1, '2002-06-14', 'Испытания пройдены', 'PSI-2002-001'),
(5, 2, '2003-07-19', 'Соответствует требованиям', 'PSI-2003-002'),
(5, 3, '2004-03-09', 'Успешное завершение ПСИ', 'PSI-2004-003'),
(5, 4, '2005-09-24', 'Испытания пройдены', 'PSI-2005-004'),
(5, 5, '2006-05-17', 'Соответствует спецификациям', 'PSI-2006-005'),
(5, 6, '2007-02-12', 'Испытания пройдены', 'PSI-2007-006'),
(5, 7, '2008-08-05', 'Соответствует требованиям', 'PSI-2008-007'),
(12, 8, '2023-01-15', 'Испытания пройдены, соответствует спецификации', 'PSI-2023-008'),
(12, 9, '2023-03-20', 'Успешное завершение ПСИ', 'PSI-2023-009'),
(12, 10, '2023-06-10', 'Испытания пройдены', 'PSI-2023-010'),
(12, 11, '2023-01-15', 'Испытания пройдены, соответствует спецификации', 'PSI-2023-011'),
(12, 12, '2023-02-20', 'Успешное завершение ПСИ', 'PSI-2023-012'),
(12, 13, '2023-03-10', 'Испытания пройдены', 'PSI-2023-013'),
(12, 14, '2023-04-05', 'Соответствует требованиям ТУ', 'PSI-2023-014'),
(12, 15, '2023-05-12', 'Испытания пройдены успешно', 'PSI-2023-015'),
(12, 16, '2023-06-18', 'Соответствует спецификации', 'PSI-2023-016'),
(12, 17, '2023-07-22', 'Испытания пройдены', 'PSI-2023-017'),
(12, 18, '2023-08-30', 'Успешное завершение ПСИ', 'PSI-2023-018'),
(12, 19, '2024-01-10', 'Испытания пройдены', 'PSI-2024-001'),
(12, 20, '2024-02-15', 'Соответствует требованиям', 'PSI-2024-002');

-- Вставка данных о программировании для коммутаторов
INSERT INTO programmers (device_id, ip, place, serial_number, stand, type) VALUES
(11, '192.168.1.111', 'Цех программирования №2', 'PRG011', 'Стенд А-11', 'ISN42124T5C4'),
(12, '192.168.1.112', 'Цех программирования №2', 'PRG012', 'Стенд А-12', 'ISN42124T5C4'),
(13, '192.168.1.113', 'Цех программирования №2', 'PRG013', 'Стенд А-13', 'ISN42124T5C4'),
(14, '192.168.1.114', 'Цех программирования №3', 'PRG014', 'Стенд Б-1', 'ISN42124T5P5'),
(15, '192.168.1.115', 'Цех программирования №3', 'PRG015', 'Стенд Б-2', 'ISN42124T5P5'),
(16, '192.168.1.116', 'Цех программирования №3', 'PRG016', 'Стенд Б-3', 'ISN42124T5P5'),
(17, '192.168.1.117', 'Цех программирования №4', 'PRG017', 'Стенд В-1', 'ISN42124X5'),
(18, '192.168.1.118', 'Цех программирования №4', 'PRG018', 'Стенд В-2', 'ISN42124X5'),
(19, '192.168.1.119', 'Цех программирования №2', 'PRG019', 'Стенд А-19', 'ISN42124T5C4'),
(20, '192.168.1.120', 'Цех программирования №3', 'PRG020', 'Стенд Б-4', 'ISN42124T5P5');

-- Вставка статистики
INSERT INTO statistic (device_id, date_time, device_type, manufacturer, modification_type, serial_number, stand, status) VALUES
(1, '2002-06-15 16:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS101016430001', 'Стенд 1', true),
(2, '2003-07-20 16:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS102016430002', 'Стенд 2', true),
(3, '2004-03-10 15:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS103016430003', 'Стенд 3', true),
(4, '2005-09-25 17:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS104016430004', 'Стенд 4', true),
(5, '2006-05-18 16:15:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS105016430005', 'Стенд 5', true),
(6, '2007-02-12 14:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS106016430006', 'Стенд 6', true),
(7, '2008-08-05 15:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS107016430007', 'Стенд 7', true),
(8, '2023-01-15 16:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN50502T5', 'RS108026430008', 'Стенд 8', true),
(9, '2023-03-20 16:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN50502T5', 'RS109026430009', 'Стенд 9', true),
(10, '2023-06-10 17:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN50502T5', 'RS110026430010', 'Стенд 10', true),
(11, '2023-01-15 16:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430001', 'Стенд А-11', true),
(12, '2023-02-20 16:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430002', 'Стенд А-12', true),
(13, '2023-03-10 15:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430003', 'Стенд А-13', true),
(14, '2023-04-05 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430004', 'Стенд Б-1', true),
(15, '2023-05-12 16:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430005', 'Стенд Б-2', true),
(16, '2023-06-18 17:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430006', 'Стенд Б-3', true),
(17, '2023-07-22 16:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430007', 'Стенд В-1', true),
(18, '2023-08-30 17:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430008', 'Стенд В-2', true),
(19, '2024-01-10 16:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430009', 'Стенд А-19', true),
(20, '2024-02-15 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430010', 'Стенд Б-4', true);

-- Добавление истории операций
INSERT INTO history (device_id, commentary, date_time, device_serial_num, file, message) VALUES
(1, 'Первоначальная настройка', '2002-06-15 14:30:00', 'RS101016430001', 'config_rs001.txt', 'Устройство успешно сконфигурировано'),
(2, 'Обновление прошивки', '2003-07-20 15:00:00', 'RS102016430002', 'firmware_update.log', 'Прошивка обновлена до версии 1.3'),
(3, 'Калибровка портов', '2004-03-10 14:45:00', 'RS103016430003', 'calibration.log', 'Калибровка выполнена успешно'),
(8, 'Первоначальная настройка', '2023-01-15 15:30:00', 'RS108026430008', 'config_rs008.txt', 'Устройство успешно сконфигурировано'),
(9, 'Обновление ПО', '2023-03-20 16:00:00', 'RS109026430009', 'update.log', 'Обновление до версии 6.4'),
(11, 'Первоначальная настройка PoE', '2023-01-15 15:30:00', 'SA101026430001', 'poe_config.txt', 'PoE сконфигурирован для всех портов'),
(12, 'Тестирование производительности', '2023-02-20 16:00:00', 'SA101026430002', 'performance_test.log', 'Пропускная способность в норме'),
(14, 'Настройка VLAN', '2023-04-05 17:30:00', 'SA102026430004', 'vlan_config.txt', 'Настроено 16 VLAN'),
(17, 'Обновление ПО', '2023-07-22 16:00:00', 'SA103026430007', 'update_4.0.log', 'Обновление до версии 4.0 успешно');

-- Добавление информации о ремонтах
INSERT INTO repair (device_id, date_time, date_time_repair, device_serial_num, message) VALUES
(3, '2005-06-10 10:00:00', '2005-06-12 14:00:00', 'RS103016430003', 'Замена блока питания'),
(5, '2008-03-15 11:30:00', '2008-03-16 16:30:00', 'RS105016430005', 'Профилактическое обслуживание'),
(15, '2023-08-01 09:00:00', '2023-08-02 13:00:00', 'SA102026430005', 'Калибровка PoE портов');

-- Добавление ошибок устройств
INSERT INTO device_error (device_id, date, debug_info, error_code, ip, serial_num, stand, status) VALUES
(3, '2005-06-10', 'Power supply failure', 'ERR-001', '192.168.1.103', 'RS103016430003', 'Стенд 3', false),
(15, '2023-08-01', 'PoE port 5 overcurrent', 'ERR-023', '192.168.1.115', 'SA102026430005', 'Стенд Б-2', true),
(18, '2023-09-15', 'Temperature warning', 'ERR-045', '192.168.1.118', 'SA103026430008', 'Стенд В-2', true);

-- Добавление Xray данных
INSERT INTO xray (device_id, file, serial_num) VALUES
(1, 'xray_rs001_2002.jpg', 'XR00123001'),
(2, 'xray_rs002_2003.jpg', 'XR00123002'),
(3, 'xray_rs003_2004.jpg', 'XR00123003'),
(8, 'xray_rs008_2023.jpg', 'XR00123008'),
(9, 'xray_rs009_2023.jpg', 'XR00123009'),
(11, 'xray_sa001_2023.jpg', 'XR00223001'),
(12, 'xray_sa002_2023.jpg', 'XR00223002'),
(14, 'xray_sa004_2023.jpg', 'XR00223003'),
(17, 'xray_sa007_2023.jpg', 'XR00223004');

-- Вывод информации о количестве добавленных записей
SELECT 'БД успешно создана и заполнена!' as 'Статус';
SELECT COUNT(*) as 'Всего устройств' FROM devices;
SELECT COUNT(*) as 'Сервисных маршрутизаторов (RS)' FROM devices WHERE device_type_id = (SELECT id FROM device_type WHERE code = 'RS');
SELECT COUNT(*) as 'Коммутаторов доступа (SA)' FROM devices WHERE device_type_id = (SELECT id FROM device_type WHERE code = 'SA');
SELECT COUNT(*) as 'Сотрудников' FROM employees;
SELECT COUNT(*) as 'MAC-адресов' FROM macs;