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
('18', 'АО НПП Исток Цех №7'),
('19', 'АО НПП Исток Цех №8'),
('20', 'АО НПП Исток Цех №9');

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
('Ремонтная зона');

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
('bmc_router_v3.1.bin', '3.1');

INSERT INTO uboot (file_uboot, version_uboot) VALUES
('uboot_v2022.01', '2022.01'), 
('uboot_v2022.04', '2022.04'), 
('uboot_v2023.01', '2023.01'), 
('uboot_v2023.04', '2023.04'),
('uboot_switch_v2023.01', '2023.01'),
('uboot_switch_v2023.06', '2023.06'),
('uboot_switch_v2024.01', '2024.01'),
('uboot_router_v2023.01', '2023.01'),
('uboot_router_v2024.01', '2024.01');

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
('routeros_7.1.iso', '7.1');

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
-- Дополнительные сотрудники (14-20)
('Козлов', 'Дмитрий', 'Алексеевич', 'Сборщик', 'kozlov_d', '123', 'user'),
('Лебедева', 'Анна', 'Сергеевна', 'Электрик', 'lebedeva_a', '123', 'user'),
('Соловьев', 'Максим', 'Игоревич', 'Инженер ПСИ', 'solovyev_m', '123', 'user'),
('Григорьев', 'Андрей', 'Владимирович', 'Техник', 'grigoryev_a', '123', 'user'),
('Федорова', 'Екатерина', 'Дмитриевна', 'Сборщик', 'fedorova_e', '123', 'user'),
('Николаев', 'Сергей', 'Петрович', 'Электрик', 'nikolaev_s', '123', 'user'),
('Алексеева', 'Татьяна', 'Михайловна', 'Инженер ПСИ', 'alekseeva_t', '123', 'user');

-- Вставка маршрутизаторов
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
-- RS маршрутизаторы (1-7)
((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '10'), 
 (SELECT id FROM production_month WHERE code = '6'), 
 (SELECT id FROM production_year WHERE code = '1'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '1.2'), 
 (SELECT id FROM uboot WHERE version_uboot = '2022.01'), 
 (SELECT id FROM iso WHERE version_iso = '6.0'),
 'RS101016430001', '001', '2002-06-15', 'ISN4150873 +10n',
 'RouterOS 6.0', true, '2002-06-15 10:00:00', '2002-06-15 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '12'), 
 (SELECT id FROM production_month WHERE code = '7'), 
 (SELECT id FROM production_year WHERE code = '2'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '1.3'), 
 (SELECT id FROM uboot WHERE version_uboot = '2022.04'), 
 (SELECT id FROM iso WHERE version_iso = '6.1'),
 'RS102016430002', '002', '2003-07-20', 'ISN4150873 +10n',
 'RouterOS 6.1', true, '2003-07-20 10:00:00', '2003-07-20 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '13'), 
 (SELECT id FROM production_month WHERE code = '3'), 
 (SELECT id FROM production_year WHERE code = '3'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '1.4'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.01'), 
 (SELECT id FROM iso WHERE version_iso = '6.2'),
 'RS103016430003', '003', '2004-03-10', 'ISN4150873 +10n',
 'RouterOS 6.2', true, '2004-03-10 10:00:00', '2004-03-10 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '14'), 
 (SELECT id FROM production_month WHERE code = '9'), 
 (SELECT id FROM production_year WHERE code = '4'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '1.5'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.04'), 
 (SELECT id FROM iso WHERE version_iso = '6.3'),
 'RS104016430004', '004', '2005-09-25', 'ISN4150873 +10n',
 'RouterOS 6.3', true, '2005-09-25 10:00:00', '2005-09-25 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '5'), 
 (SELECT id FROM production_year WHERE code = '5'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2022.01'), 
 (SELECT id FROM iso WHERE version_iso = '6.4'),
 'RS105016430005', '005', '2006-05-18', 'ISN4150873 +10n',
 'RouterOS 6.4', true, '2006-05-18 10:00:00', '2006-05-18 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '10'), 
 (SELECT id FROM production_month WHERE code = '2'), 
 (SELECT id FROM production_year WHERE code = '6'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.04'), 
 (SELECT id FROM iso WHERE version_iso = '6.4'),
 'RS106016430006', '006', '2007-02-12', 'ISN4150873 +10n',
 'RouterOS 6.4', true, '2007-02-12 10:00:00', '2007-02-12 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '12'), 
 (SELECT id FROM production_month WHERE code = '8'), 
 (SELECT id FROM production_year WHERE code = '7'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.01'), 
 (SELECT id FROM iso WHERE version_iso = '6.3'),
 'RS107016430007', '007', '2008-08-05', 'ISN4150873 +10n',
 'RouterOS 6.3', true, '2008-08-05 10:00:00', '2008-08-05 14:00:00'),

-- Дополнительные RS маршрутизаторы (8-12)
((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '4'), 
 (SELECT id FROM production_year WHERE code = '8'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.01'), 
 (SELECT id FROM iso WHERE version_iso = '7.0'),
 'RS108016430008', '008', '2009-04-15', 'ISN4150873 +10n',
 'RouterOS 7.0', true, '2009-04-15 10:00:00', '2009-04-15 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '10'), 
 (SELECT id FROM production_year WHERE code = '9'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.04'), 
 (SELECT id FROM iso WHERE version_iso = '7.0'),
 'RS109016430009', '009', '2010-10-20', 'ISN4150873 +10n',
 'RouterOS 7.0', true, '2010-10-20 10:00:00', '2010-10-20 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '19'), 
 (SELECT id FROM production_month WHERE code = '1'), 
 (SELECT id FROM production_year WHERE code = '10'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '7.1'),
 'RS110016430010', '010', '2011-01-25', 'ISN4150873 +10n',
 'RouterOS 7.1', true, '2011-01-25 10:00:00', '2011-01-25 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RS'), 
 (SELECT id FROM place_of_production WHERE code = '20'), 
 (SELECT id FROM production_month WHERE code = '11'), 
 (SELECT id FROM production_year WHERE code = '11'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '3.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '7.1'),
 'RS111016430011', '011', '2012-11-30', 'ISN4150873 +10n',
 'RouterOS 7.1', true, '2012-11-30 10:00:00', '2012-11-30 14:00:00');

-- Вставка коммутаторов (13-27)
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
-- ISN42124T5C4 модели (13-17)
((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '1'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '1.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.01'), 
 (SELECT id FROM iso WHERE version_iso = '3.0'),
 'SA101026430001', '001', '2023-01-15', 'ISN42124T5C4',
 'SwitchOS 3.0', true, '2023-01-15 10:00:00', '2023-01-15 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '2'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '1.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.01'), 
 (SELECT id FROM iso WHERE version_iso = '3.0'),
 'SA101026430002', '002', '2023-02-20', 'ISN42124T5C4',
 'SwitchOS 3.0', true, '2023-02-20 10:00:00', '2023-02-20 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '3'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '1.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.06'), 
 (SELECT id FROM iso WHERE version_iso = '3.1'),
 'SA101026430003', '003', '2023-03-10', 'ISN42124T5C4',
 'SwitchOS 3.1', true, '2023-03-10 10:00:00', '2023-03-10 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '4'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '1.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.06'), 
 (SELECT id FROM iso WHERE version_iso = '3.1'),
 'SA101026430004', '004', '2023-04-18', 'ISN42124T5C4',
 'SwitchOS 3.1', true, '2023-04-18 10:00:00', '2023-04-18 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '5'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.06'), 
 (SELECT id FROM iso WHERE version_iso = '3.2'),
 'SA101026430005', '005', '2023-05-22', 'ISN42124T5C4',
 'SwitchOS 3.2', true, '2023-05-22 10:00:00', '2023-05-22 14:00:00'),

-- ISN42124T5P5 модели (18-22)
((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '4'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.06'), 
 (SELECT id FROM iso WHERE version_iso = '3.1'),
 'SA102026430006', '006', '2023-04-05', 'ISN42124T5P5',
 'SwitchOS 3.1', true, '2023-04-05 10:00:00', '2023-04-05 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '5'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2023.06'), 
 (SELECT id FROM iso WHERE version_iso = '3.2'),
 'SA102026430007', '007', '2023-05-12', 'ISN42124T5P5',
 'SwitchOS 3.2', true, '2023-05-12 10:00:00', '2023-05-12 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '6'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA102026430008', '008', '2023-06-18', 'ISN42124T5P5',
 'SwitchOS 4.0', true, '2023-06-18 10:00:00', '2023-06-18 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '7'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA102026430009', '009', '2023-07-25', 'ISN42124T5P5',
 'SwitchOS 4.0', true, '2023-07-25 10:00:00', '2023-07-25 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '8'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA102026430010', '010', '2023-08-14', 'ISN42124T5P5',
 'SwitchOS 4.0', true, '2023-08-14 10:00:00', '2023-08-14 14:00:00'),

-- ISN42124X5 модели (23-25)
((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '7'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA103026430011', '011', '2023-07-22', 'ISN42124X5',
 'SwitchOS 4.0', true, '2023-07-22 10:00:00', '2023-07-22 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '8'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA103026430012', '012', '2023-08-30', 'ISN42124X5',
 'SwitchOS 4.0', true, '2023-08-30 10:00:00', '2023-08-30 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '16'), 
 (SELECT id FROM production_month WHERE code = '9'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA103026430013', '013', '2023-09-15', 'ISN42124X5',
 'SwitchOS 4.0', true, '2023-09-15 10:00:00', '2023-09-15 14:00:00'),

-- Коммутаторы 2024 года (26-27)
((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '17'), 
 (SELECT id FROM production_month WHERE code = '1'), 
 (SELECT id FROM production_year WHERE code = '23'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA101026430014', '014', '2024-01-10', 'ISN42124T5C4',
 'SwitchOS 4.0', true, '2024-01-10 10:00:00', '2024-01-10 14:00:00'),

((SELECT id FROM device_type WHERE code = 'SA'), 
 (SELECT id FROM place_of_production WHERE code = '18'), 
 (SELECT id FROM production_month WHERE code = '2'), 
 (SELECT id FROM production_year WHERE code = '23'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Цех сборки №1'),
 (SELECT id FROM bmc WHERE version_bmc = '2.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '4.0'),
 'SA102026430015', '015', '2024-02-15', 'ISN42124T5P5',
 'SwitchOS 4.0', true, '2024-02-15 10:00:00', '2024-02-15 14:00:00');

-- Вставка RB маршрутизаторов (28-30)
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
((SELECT id FROM device_type WHERE code = 'RB'), 
 (SELECT id FROM place_of_production WHERE code = '10'), 
 (SELECT id FROM production_month WHERE code = '3'), 
 (SELECT id FROM production_year WHERE code = '20'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '3.0'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '7.1'),
 'RB101026430001', '001', '2021-03-10', 'ISN4200873 +10n',
 'RouterOS 7.1', true, '2021-03-10 10:00:00', '2021-03-10 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RB'), 
 (SELECT id FROM place_of_production WHERE code = '12'), 
 (SELECT id FROM production_month WHERE code = '6'), 
 (SELECT id FROM production_year WHERE code = '21'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '3.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '7.1'),
 'RB102026430002', '002', '2022-06-20', 'ISN4200873 +10n',
 'RouterOS 7.1', true, '2022-06-20 10:00:00', '2022-06-20 14:00:00'),

((SELECT id FROM device_type WHERE code = 'RB'), 
 (SELECT id FROM place_of_production WHERE code = '14'), 
 (SELECT id FROM production_month WHERE code = '9'), 
 (SELECT id FROM production_year WHERE code = '22'),
 (SELECT id FROM production_stage WHERE code = '5'), 
 (SELECT id FROM location WHERE name = 'Склад готовой продукции'),
 (SELECT id FROM bmc WHERE version_bmc = '3.1'), 
 (SELECT id FROM uboot WHERE version_uboot = '2024.01'), 
 (SELECT id FROM iso WHERE version_iso = '7.1'),
 'RB103026430003', '003', '2023-09-05', 'ISN4200873 +10n',
 'RouterOS 7.1', true, '2023-09-05 10:00:00', '2023-09-05 14:00:00');

-- Вставка MAC-адресов для всех устройств
INSERT INTO macs (device_id, mac_address, interface_name, assignment_date) VALUES
-- Маршрутизаторы RS (1-12)
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
(8, '00:1B:44:11:3A:C5', 'eth0', '2009-04-15'),
(8, '00:1B:44:11:3A:C6', 'eth1', '2009-04-15'),
(9, '00:1B:44:11:3A:C7', 'eth0', '2010-10-20'),
(9, '00:1B:44:11:3A:C8', 'eth1', '2010-10-20'),
(10, '00:1B:44:11:3A:C9', 'eth0', '2011-01-25'),
(10, '00:1B:44:11:3A:D0', 'eth1', '2011-01-25'),
(11, '00:1B:44:11:3A:D1', 'eth0', '2012-11-30'),
(11, '00:1B:44:11:3A:D2', 'eth1', '2012-11-30'),
(12, '00:1B:44:11:3A:D3', 'eth0', '2013-05-15'),
(12, '00:1B:44:11:3A:D4', 'eth1', '2013-05-15'),

-- Коммутаторы SA (13-27)
(13, '00:1C:44:11:3A:E1', 'eth0', '2023-01-15'),
(13, '00:1C:44:11:3A:E2', 'eth1', '2023-01-15'),
(13, '00:1C:44:11:3A:E3', 'management', '2023-01-15'),
(14, '00:1C:44:11:3A:E4', 'eth0', '2023-02-20'),
(14, '00:1C:44:11:3A:E5', 'eth1', '2023-02-20'),
(14, '00:1C:44:11:3A:E6', 'management', '2023-02-20'),
(15, '00:1C:44:11:3A:E7', 'eth0', '2023-03-10'),
(15, '00:1C:44:11:3A:E8', 'eth1', '2023-03-10'),
(15, '00:1C:44:11:3A:E9', 'management', '2023-03-10'),
(16, '00:1C:44:11:3A:F0', 'eth0', '2023-04-18'),
(16, '00:1C:44:11:3A:F1', 'eth1', '2023-04-18'),
(16, '00:1C:44:11:3A:F2', 'management', '2023-04-18'),
(17, '00:1C:44:11:3A:F3', 'eth0', '2023-05-22'),
(17, '00:1C:44:11:3A:F4', 'eth1', '2023-05-22'),
(17, '00:1C:44:11:3A:F5', 'management', '2023-05-22'),
(18, '00:1C:44:11:3A:F6', 'eth0', '2023-04-05'),
(18, '00:1C:44:11:3A:F7', 'eth1', '2023-04-05'),
(18, '00:1C:44:11:3A:F8', 'management', '2023-04-05'),
(19, '00:1C:44:11:3A:F9', 'eth0', '2023-05-12'),
(19, '00:1C:44:11:3A:G0', 'eth1', '2023-05-12'),
(19, '00:1C:44:11:3A:G1', 'management', '2023-05-12'),
(20, '00:1C:44:11:3A:G2', 'eth0', '2023-06-18'),
(20, '00:1C:44:11:3A:G3', 'eth1', '2023-06-18'),
(20, '00:1C:44:11:3A:G4', 'management', '2023-06-18'),
(21, '00:1C:44:11:3A:G5', 'eth0', '2023-07-25'),
(21, '00:1C:44:11:3A:G6', 'eth1', '2023-07-25'),
(21, '00:1C:44:11:3A:G7', 'management', '2023-07-25'),
(22, '00:1C:44:11:3A:G8', 'eth0', '2023-08-14'),
(22, '00:1C:44:11:3A:G9', 'eth1', '2023-08-14'),
(22, '00:1C:44:11:3A:H0', 'management', '2023-08-14'),
(23, '00:1C:44:11:3A:H1', 'eth0', '2023-07-22'),
(23, '00:1C:44:11:3A:H2', 'eth1', '2023-07-22'),
(23, '00:1C:44:11:3A:H3', 'management', '2023-07-22'),
(24, '00:1C:44:11:3A:H4', 'eth0', '2023-08-30'),
(24, '00:1C:44:11:3A:H5', 'eth1', '2023-08-30'),
(24, '00:1C:44:11:3A:H6', 'management', '2023-08-30'),
(25, '00:1C:44:11:3A:H7', 'eth0', '2023-09-15'),
(25, '00:1C:44:11:3A:H8', 'eth1', '2023-09-15'),
(25, '00:1C:44:11:3A:H9', 'management', '2023-09-15'),
(26, '00:1C:44:11:3A:I0', 'eth0', '2024-01-10'),
(26, '00:1C:44:11:3A:I1', 'eth1', '2024-01-10'),
(26, '00:1C:44:11:3A:I2', 'management', '2024-01-10'),
(27, '00:1C:44:11:3A:I3', 'eth0', '2024-02-15'),
(27, '00:1C:44:11:3A:I4', 'eth1', '2024-02-15'),
(27, '00:1C:44:11:3A:I5', 'management', '2024-02-15'),

-- RB маршрутизаторы (28-30)
(28, '00:1D:44:11:3A:J1', 'eth0', '2021-03-10'),
(28, '00:1D:44:11:3A:J2', 'eth1', '2021-03-10'),
(28, '00:1D:44:11:3A:J3', 'management', '2021-03-10'),
(29, '00:1D:44:11:3A:J4', 'eth0', '2022-06-20'),
(29, '00:1D:44:11:3A:J5', 'eth1', '2022-06-20'),
(29, '00:1D:44:11:3A:J6', 'management', '2022-06-20'),
(30, '00:1D:44:11:3A:J7', 'eth0', '2023-09-05'),
(30, '00:1D:44:11:3A:J8', 'eth1', '2023-09-05'),
(30, '00:1D:44:11:3A:J9', 'management', '2023-09-05');

-- Серийные номера для маршрутизаторов RS (1-12)
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(1, 'SNB00123001', true, 'Иванов А.П.', '2002-06-10 10:00:00'),
(2, 'SNB00123002', true, 'Петров С.И.', '2003-07-15 11:30:00'),
(3, 'SNB00123003', true, 'Иванов А.П.', '2004-03-05 09:45:00'),
(4, 'SNB00123004', true, 'Петров С.И.', '2005-09-20 14:20:00'),
(5, 'SNB00123005', true, 'Иванов А.П.', '2006-05-12 16:10:00'),
(6, 'SNB00123006', true, 'Петров С.И.', '2007-02-10 10:30:00'),
(7, 'SNB00123007', true, 'Иванов А.П.', '2008-08-03 13:15:00'),
(8, 'SNB00123008', true, 'Петров С.И.', '2009-04-10 11:00:00'),
(9, 'SNB00123009', true, 'Иванов А.П.', '2010-10-15 14:30:00'),
(10, 'SNB00123010', true, 'Петров С.И.', '2011-01-20 09:45:00'),
(11, 'SNB00123011', true, 'Иванов А.П.', '2012-11-25 16:20:00'),
(12, 'SNB00123012', true, 'Петров С.И.', '2013-05-10 13:15:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(1, 'PCBSN00123001'), (2, 'PCBSN00123002'), (3, 'PCBSN00123003'),
(4, 'PCBSN00123004'), (5, 'PCBSN00123005'), (6, 'PCBSN00123006'),
(7, 'PCBSN00123007'), (8, 'PCBSN00123008'), (9, 'PCBSN00123009'),
(10, 'PCBSN00123010'), (11, 'PCBSN00123011'), (12, 'PCBSN00123012');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(1, 'ROUTER00123001'), (2, 'ROUTER00123002'), (3, 'ROUTER00123003'),
(4, 'ROUTER00123004'), (5, 'ROUTER00123005'), (6, 'ROUTER00123006'),
(7, 'ROUTER00123007'), (8, 'ROUTER00123008'), (9, 'ROUTER00123009'),
(10, 'ROUTER00123010'), (11, 'ROUTER00123011'), (12, 'ROUTER00123012');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(1, 'PKG00123001'), (2, 'PKG00123002'), (3, 'PKG00123003'),
(4, 'PKG00123004'), (5, 'PKG00123005'), (6, 'PKG00123006'),
(7, 'PKG00123007'), (8, 'PKG00123008'), (9, 'PKG00123009'),
(10, 'PKG00123010'), (11, 'PKG00123011'), (12, 'PKG00123012');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(1, 'CASE00123001'), (2, 'CASE00123002'), (3, 'CASE00123003'),
(4, 'CASE00123004'), (5, 'CASE00123005'), (6, 'CASE00123006'),
(7, 'CASE00123007'), (8, 'CASE00123008'), (9, 'CASE00123009'),
(10, 'CASE00123010'), (11, 'CASE00123011'), (12, 'CASE00123012');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(1, 'BP00123001'), (2, 'BP00123002'), (3, 'BP00123003'),
(4, 'BP00123004'), (5, 'BP00123005'), (6, 'BP00123006'),
(7, 'BP00123007'), (8, 'BP00123008'), (9, 'BP00123009'),
(10, 'BP00123010'), (11, 'BP00123011'), (12, 'BP00123012');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(1, 'PKI00123001'), (2, 'PKI00123002'), (3, 'PKI00123003'),
(4, 'PKI00123004'), (5, 'PKI00123005'), (6, 'PKI00123006'),
(7, 'PKI00123007'), (8, 'PKI00123008'), (9, 'PKI00123009'),
(10, 'PKI00123010'), (11, 'PKI00123011'), (12, 'PKI00123012');

-- Серийные номера для коммутаторов SA (13-27)
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(13, 'SNB00223001', true, 'Соколов А.В.', '2023-01-14 09:30:00'),
(14, 'SNB00223002', true, 'Михайлов Д.С.', '2023-02-19 10:15:00'),
(15, 'SNB00223003', true, 'Соколов А.В.', '2023-03-09 11:45:00'),
(16, 'SNB00223004', true, 'Михайлов Д.С.', '2023-04-17 13:20:00'),
(17, 'SNB00223005', true, 'Соколов А.В.', '2023-05-21 14:30:00'),
(18, 'SNB00223006', true, 'Михайлов Д.С.', '2023-04-04 13:20:00'),
(19, 'SNB00223007', true, 'Соколов А.В.', '2023-05-11 14:30:00'),
(20, 'SNB00223008', true, 'Михайлов Д.С.', '2023-06-17 15:45:00'),
(21, 'SNB00223009', true, 'Соколов А.В.', '2023-07-24 10:00:00'),
(22, 'SNB00223010', true, 'Михайлов Д.С.', '2023-08-13 16:20:00'),
(23, 'SNB00223011', true, 'Соколов А.В.', '2023-07-21 10:00:00'),
(24, 'SNB00223012', true, 'Михайлов Д.С.', '2023-08-29 16:20:00'),
(25, 'SNB00223013', true, 'Соколов А.В.', '2023-09-14 11:00:00'),
(26, 'SNB00223014', true, 'Михайлов Д.С.', '2024-01-09 14:30:00'),
(27, 'SNB00223015', true, 'Соколов А.В.', '2024-02-14 11:00:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(13, 'PCBSN00223001'), (14, 'PCBSN00223002'), (15, 'PCBSN00223003'),
(16, 'PCBSN00223004'), (17, 'PCBSN00223005'), (18, 'PCBSN00223006'),
(19, 'PCBSN00223007'), (20, 'PCBSN00223008'), (21, 'PCBSN00223009'),
(22, 'PCBSN00223010'), (23, 'PCBSN00223011'), (24, 'PCBSN00223012'),
(25, 'PCBSN00223013'), (26, 'PCBSN00223014'), (27, 'PCBSN00223015');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(13, 'SWRTR00223001'), (14, 'SWRTR00223002'), (15, 'SWRTR00223003'),
(16, 'SWRTR00223004'), (17, 'SWRTR00223005'), (18, 'SWRTR00223006'),
(19, 'SWRTR00223007'), (20, 'SWRTR00223008'), (21, 'SWRTR00223009'),
(22, 'SWRTR00223010'), (23, 'SWRTR00223011'), (24, 'SWRTR00223012'),
(25, 'SWRTR00223013'), (26, 'SWRTR00223014'), (27, 'SWRTR00223015');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(13, 'PKG00223001'), (14, 'PKG00223002'), (15, 'PKG00223003'),
(16, 'PKG00223004'), (17, 'PKG00223005'), (18, 'PKG00223006'),
(19, 'PKG00223007'), (20, 'PKG00223008'), (21, 'PKG00223009'),
(22, 'PKG00223010'), (23, 'PKG00223011'), (24, 'PKG00223012'),
(25, 'PKG00223013'), (26, 'PKG00223014'), (27, 'PKG00223015');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(13, 'CASE00223001'), (14, 'CASE00223002'), (15, 'CASE00223003'),
(16, 'CASE00223004'), (17, 'CASE00223005'), (18, 'CASE00223006'),
(19, 'CASE00223007'), (20, 'CASE00223008'), (21, 'CASE00223009'),
(22, 'CASE00223010'), (23, 'CASE00223011'), (24, 'CASE00223012'),
(25, 'CASE00223013'), (26, 'CASE00223014'), (27, 'CASE00223015');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(13, 'BP00223001'), (14, 'BP00223002'), (15, 'BP00223003'),
(16, 'BP00223004'), (17, 'BP00223005'), (18, 'BP00223006'),
(19, 'BP00223007'), (20, 'BP00223008'), (21, 'BP00223009'),
(22, 'BP00223010'), (23, 'BP00223011'), (24, 'BP00223012'),
(25, 'BP00223013'), (26, 'BP00223014'), (27, 'BP00223015');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(13, 'PKI00223001'), (14, 'PKI00223002'), (15, 'PKI00223003'),
(16, 'PKI00223004'), (17, 'PKI00223005'), (18, 'PKI00223006'),
(19, 'PKI00223007'), (20, 'PKI00223008'), (21, 'PKI00223009'),
(22, 'PKI00223010'), (23, 'PKI00223011'), (24, 'PKI00223012'),
(25, 'PKI00223013'), (26, 'PKI00223014'), (27, 'PKI00223015');

-- Серийные номера для RB маршрутизаторов (28-30)
INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(28, 'SNB00323001', true, 'Козлов Д.А.', '2021-03-08 10:30:00'),
(29, 'SNB00323002', true, 'Федорова Е.Д.', '2022-06-18 11:45:00'),
(30, 'SNB00323003', true, 'Козлов Д.А.', '2023-09-03 14:15:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(28, 'PCBSN00323001'), (29, 'PCBSN00323002'), (30, 'PCBSN00323003');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(28, 'RBROUTER00123001'), (29, 'RBROUTER00123002'), (30, 'RBROUTER00123003');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(28, 'PKG00323001'), (29, 'PKG00323002'), (30, 'PKG00323003');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(28, 'CASE00323001'), (29, 'CASE00323002'), (30, 'CASE00323003');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(28, 'BP00323001'), (29, 'BP00323002'), (30, 'BP00323003');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(28, 'PKI00323001'), (29, 'PKI00323002'), (30, 'PKI00323003');

-- Обновление внешних ключей для всех устройств (с использованием цикла для сокращения кода)
-- В реальном выполнении нужно раскомментировать и выполнить для каждого ID

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

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 11 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 11 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 11 AND interface_name = 'eth0'),
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
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 12 AND interface_name = 'eth0'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 12),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 12),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 12),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 12),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 12),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 12),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 12)
WHERE id = 12;

-- Для коммутаторов SA (13-27) с management интерфейсом
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

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 21 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 21 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 21 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 21),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 21),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 21),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 21),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 21),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 21),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 21)
WHERE id = 21;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 22 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 22 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 22 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 22),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 22),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 22),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 22),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 22),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 22),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 22)
WHERE id = 22;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 23 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 23 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 23 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 23),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 23),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 23),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 23),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 23),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 23),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 23)
WHERE id = 23;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 24 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 24 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 24 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 24),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 24),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 24),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 24),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 24),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 24),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 24)
WHERE id = 24;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 25 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 25 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 25 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 25),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 25),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 25),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 25),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 25),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 25),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 25)
WHERE id = 25;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 26 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 26 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 26 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 26),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 26),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 26),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 26),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 26),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 26),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 26)
WHERE id = 26;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 27 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 27 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 27 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 27),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 27),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 27),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 27),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 27),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 27),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 27)
WHERE id = 27;

-- Для RB маршрутизаторов (28-30)
UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 28 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 28 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 28 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 28),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 28),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 28),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 28),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 28),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 28),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 28)
WHERE id = 28;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 29 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 29 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 29 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 29),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 29),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 29),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 29),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 29),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 29),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 29)
WHERE id = 29;

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = 30 AND interface_name = 'eth0'),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = 30 AND interface_name = 'eth1'),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = 30 AND interface_name = 'management'),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = 30),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = 30),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = 30),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = 30),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = 30),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = 30),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = 30)
WHERE id = 30;

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

-- Вставка данных о сборке для маршрутизаторов RS (1-12)
INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(1, 1, '2002-06-12'), (2, 2, '2003-07-17'), (1, 3, '2004-03-07'),
(2, 4, '2005-09-22'), (1, 5, '2006-05-15'), (2, 6, '2007-02-10'),
(1, 7, '2008-08-03'), (2, 8, '2009-04-12'), (1, 9, '2010-10-18'),
(2, 10, '2011-01-22'), (1, 11, '2012-11-27'), (2, 12, '2013-05-12');

-- Вставка данных о сборке для коммутаторов SA (13-27)
INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(9, 13, '2023-01-14'), (10, 14, '2023-02-19'), (9, 15, '2023-03-09'),
(10, 16, '2023-04-17'), (9, 17, '2023-05-21'), (10, 18, '2023-04-04'),
(9, 19, '2023-05-11'), (10, 20, '2023-06-17'), (9, 21, '2023-07-24'),
(10, 22, '2023-08-13'), (9, 23, '2023-07-21'), (10, 24, '2023-08-29'),
(9, 25, '2023-09-14'), (10, 26, '2024-01-09'), (9, 27, '2024-02-14');

-- Вставка данных о сборке для RB маршрутизаторов (28-30)
INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(14, 28, '2021-03-08'), (17, 29, '2022-06-18'), (14, 30, '2023-09-03');

-- Вставка данных о диагностике для маршрутизаторов RS (1-12)
INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(3, 1, '2002-06-13', 'Диагностика пройдена успешно'),
(4, 2, '2003-07-18', 'Все системы функционируют нормально'),
(3, 3, '2004-03-08', 'Диагностика без замечаний'),
(4, 4, '2005-09-23', 'Оборудование соответствует ТУ'),
(3, 5, '2006-05-16', 'Диагностика пройдена'),
(4, 6, '2007-02-11', 'Все параметры в норме'),
(3, 7, '2008-08-04', 'Диагностика успешна'),
(4, 8, '2009-04-13', 'Диагностика пройдена'),
(3, 9, '2010-10-19', 'Все системы в норме'),
(4, 10, '2011-01-23', 'Диагностика успешна'),
(3, 11, '2012-11-28', 'Оборудование исправно'),
(4, 12, '2013-05-13', 'Диагностика пройдена');

-- Вставка данных о диагностике для коммутаторов SA (13-27)
INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(11, 13, '2023-01-14', 'Диагностика успешно пройдена, PoE работает корректно'),
(11, 14, '2023-02-19', 'Все порты функционируют нормально'),
(11, 15, '2023-03-09', 'Диагностика без замечаний, температура в норме'),
(11, 16, '2023-04-17', 'PoE питание в норме'),
(11, 17, '2023-05-21', 'Все системы функционируют нормально'),
(11, 18, '2023-04-04', 'PoE питание в норме, коммутатор готов к работе'),
(11, 19, '2023-05-11', 'Все системы функционируют нормально'),
(11, 20, '2023-06-17', 'Диагностика пройдена успешно'),
(11, 21, '2023-07-24', 'Соответствует техническим условиям'),
(11, 22, '2023-08-13', 'Диагностика пройдена, ошибок не обнаружено'),
(11, 23, '2023-07-21', 'Соответствует техническим условиям'),
(11, 24, '2023-08-29', 'Диагностика пройдена, ошибок не обнаружено'),
(11, 25, '2023-09-14', 'PoE функционирует корректно'),
(11, 26, '2024-01-09', 'PoE функционирует корректно'),
(11, 27, '2024-02-14', 'Диагностика успешна');

-- Вставка данных о диагностике для RB маршрутизаторов (28-30)
INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(15, 28, '2021-03-09', 'Диагностика пройдена успешно'),
(18, 29, '2022-06-19', 'Все системы функционируют нормально'),
(15, 30, '2023-09-04', 'Диагностика успешна');

-- Вставка данных о ПСИ для маршрутизаторов RS (1-12)
INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(5, 1, '2002-06-14', 'Испытания пройдены', 'PSI-2002-001'),
(5, 2, '2003-07-19', 'Соответствует требованиям', 'PSI-2003-002'),
(5, 3, '2004-03-09', 'Успешное завершение ПСИ', 'PSI-2004-003'),
(5, 4, '2005-09-24', 'Испытания пройдены', 'PSI-2005-004'),
(5, 5, '2006-05-17', 'Соответствует спецификациям', 'PSI-2006-005'),
(5, 6, '2007-02-12', 'Испытания пройдены', 'PSI-2007-006'),
(5, 7, '2008-08-05', 'Соответствует требованиям', 'PSI-2008-007'),
(5, 8, '2009-04-14', 'Испытания пройдены', 'PSI-2009-008'),
(5, 9, '2010-10-20', 'Соответствует спецификации', 'PSI-2010-009'),
(5, 10, '2011-01-24', 'Испытания пройдены', 'PSI-2011-010'),
(5, 11, '2012-11-29', 'Соответствует требованиям', 'PSI-2012-011'),
(5, 12, '2013-05-14', 'Испытания пройдены', 'PSI-2013-012');

-- Вставка данных о ПСИ для коммутаторов SA (13-27)
INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(12, 13, '2023-01-15', 'Испытания пройдены, соответствует спецификации', 'PSI-2023-013'),
(12, 14, '2023-02-20', 'Успешное завершение ПСИ', 'PSI-2023-014'),
(12, 15, '2023-03-10', 'Испытания пройдены', 'PSI-2023-015'),
(12, 16, '2023-04-18', 'Соответствует требованиям ТУ', 'PSI-2023-016'),
(12, 17, '2023-05-22', 'Испытания пройдены успешно', 'PSI-2023-017'),
(12, 18, '2023-04-05', 'Соответствует требованиям ТУ', 'PSI-2023-018'),
(12, 19, '2023-05-12', 'Испытания пройдены успешно', 'PSI-2023-019'),
(12, 20, '2023-06-18', 'Соответствует спецификации', 'PSI-2023-020'),
(12, 21, '2023-07-25', 'Испытания пройдены', 'PSI-2023-021'),
(12, 22, '2023-08-14', 'Успешное завершение ПСИ', 'PSI-2023-022'),
(12, 23, '2023-07-22', 'Испытания пройдены', 'PSI-2023-023'),
(12, 24, '2023-08-30', 'Успешное завершение ПСИ', 'PSI-2023-024'),
(12, 25, '2023-09-15', 'Соответствует спецификации', 'PSI-2023-025'),
(12, 26, '2024-01-10', 'Испытания пройдены', 'PSI-2024-001'),
(12, 27, '2024-02-15', 'Соответствует требованиям', 'PSI-2024-002');

-- Вставка данных о ПСИ для RB маршрутизаторов (28-30)
INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(16, 28, '2021-03-10', 'Испытания пройдены', 'PSI-2021-001'),
(19, 29, '2022-06-20', 'Соответствует требованиям', 'PSI-2022-001'),
(16, 30, '2023-09-05', 'Испытания пройдены', 'PSI-2023-026');

-- Вставка данных о программировании для коммутаторов SA (13-27)
INSERT INTO programmers (device_id, ip, place, serial_number, stand, type) VALUES
(13, '192.168.1.113', 'Цех программирования №2', 'PRG013', 'Стенд А-13', 'ISN42124T5C4'),
(14, '192.168.1.114', 'Цех программирования №2', 'PRG014', 'Стенд А-14', 'ISN42124T5C4'),
(15, '192.168.1.115', 'Цех программирования №2', 'PRG015', 'Стенд А-15', 'ISN42124T5C4'),
(16, '192.168.1.116', 'Цех программирования №2', 'PRG016', 'Стенд А-16', 'ISN42124T5C4'),
(17, '192.168.1.117', 'Цех программирования №2', 'PRG017', 'Стенд А-17', 'ISN42124T5C4'),
(18, '192.168.1.118', 'Цех программирования №3', 'PRG018', 'Стенд Б-5', 'ISN42124T5P5'),
(19, '192.168.1.119', 'Цех программирования №3', 'PRG019', 'Стенд Б-6', 'ISN42124T5P5'),
(20, '192.168.1.120', 'Цех программирования №3', 'PRG020', 'Стенд Б-7', 'ISN42124T5P5'),
(21, '192.168.1.121', 'Цех программирования №3', 'PRG021', 'Стенд Б-8', 'ISN42124T5P5'),
(22, '192.168.1.122', 'Цех программирования №3', 'PRG022', 'Стенд Б-9', 'ISN42124T5P5'),
(23, '192.168.1.123', 'Цех программирования №4', 'PRG023', 'Стенд В-3', 'ISN42124X5'),
(24, '192.168.1.124', 'Цех программирования №4', 'PRG024', 'Стенд В-4', 'ISN42124X5'),
(25, '192.168.1.125', 'Цех программирования №4', 'PRG025', 'Стенд В-5', 'ISN42124X5'),
(26, '192.168.1.126', 'Цех программирования №2', 'PRG026', 'Стенд А-26', 'ISN42124T5C4'),
(27, '192.168.1.127', 'Цех программирования №3', 'PRG027', 'Стенд Б-10', 'ISN42124T5P5');

-- Вставка данных о программировании для RB маршрутизаторов (28-30)
INSERT INTO programmers (device_id, ip, place, serial_number, stand, type) VALUES
(28, '192.168.1.128', 'Цех программирования №1', 'PRG028', 'Стенд Г-1', 'ISN4200873 +10n'),
(29, '192.168.1.129', 'Цех программирования №1', 'PRG029', 'Стенд Г-2', 'ISN4200873 +10n'),
(30, '192.168.1.130', 'Цех программирования №1', 'PRG030', 'Стенд Г-3', 'ISN4200873 +10n');

-- Вставка статистики для маршрутизаторов RS (1-12)
INSERT INTO statistic (device_id, date_time, device_type, manufacturer, modification_type, serial_number, stand, status) VALUES
(1, '2002-06-15 16:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS101016430001', 'Стенд 1', true),
(2, '2003-07-20 16:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS102016430002', 'Стенд 2', true),
(3, '2004-03-10 15:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS103016430003', 'Стенд 3', true),
(4, '2005-09-25 17:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS104016430004', 'Стенд 4', true),
(5, '2006-05-18 16:15:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS105016430005', 'Стенд 5', true),
(6, '2007-02-12 14:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS106016430006', 'Стенд 6', true),
(7, '2008-08-05 15:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS107016430007', 'Стенд 7', true),
(8, '2009-04-15 14:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS108016430008', 'Стенд 8', true),
(9, '2010-10-20 16:45:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS109016430009', 'Стенд 9', true),
(10, '2011-01-25 15:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS110016430010', 'Стенд 10', true),
(11, '2012-11-30 17:00:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS111016430011', 'Стенд 11', true),
(12, '2013-05-15 16:30:00', 'Сервисный маршрутизатор', 'АО НПП Исток', 'ISN4150873 +10n', 'RS112016430012', 'Стенд 12', true);

-- Вставка статистики для коммутаторов SA (13-27)
INSERT INTO statistic (device_id, date_time, device_type, manufacturer, modification_type, serial_number, stand, status) VALUES
(13, '2023-01-15 16:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430001', 'Стенд А-13', true),
(14, '2023-02-20 16:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430002', 'Стенд А-14', true),
(15, '2023-03-10 15:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430003', 'Стенд А-15', true),
(16, '2023-04-18 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430004', 'Стенд А-16', true),
(17, '2023-05-22 16:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430005', 'Стенд А-17', true),
(18, '2023-04-05 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430006', 'Стенд Б-5', true),
(19, '2023-05-12 16:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430007', 'Стенд Б-6', true),
(20, '2023-06-18 17:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430008', 'Стенд Б-7', true),
(21, '2023-07-25 16:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430009', 'Стенд Б-8', true),
(22, '2023-08-14 17:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430010', 'Стенд Б-9', true),
(23, '2023-07-22 16:45:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430011', 'Стенд В-3', true),
(24, '2023-08-30 17:15:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430012', 'Стенд В-4', true),
(25, '2023-09-15 17:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124X5', 'SA103026430013', 'Стенд В-5', true),
(26, '2024-01-10 16:30:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5C4', 'SA101026430014', 'Стенд А-26', true),
(27, '2024-02-15 17:00:00', 'Коммутатор доступа', 'АО НПП Исток', 'ISN42124T5P5', 'SA102026430015', 'Стенд Б-10', true);

-- Вставка статистики для RB маршрутизаторов (28-30)
INSERT INTO statistic (device_id, date_time, device_type, manufacturer, modification_type, serial_number, stand, status) VALUES
(28, '2021-03-10 16:30:00', 'Граничный маршрутизатор', 'АО НПП Исток', 'ISN4200873 +10n', 'RB101026430001', 'Стенд Г-1', true),
(29, '2022-06-20 17:00:00', 'Граничный маршрутизатор', 'АО НПП Исток', 'ISN4200873 +10n', 'RB102026430002', 'Стенд Г-2', true),
(30, '2023-09-05 16:45:00', 'Граничный маршрутизатор', 'АО НПП Исток', 'ISN4200873 +10n', 'RB103026430003', 'Стенд Г-3', true);

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
('alekseeva_t', '123', 20, 'user');

-- Добавление истории операций для всех устройств
INSERT INTO history (device_id, commentary, date_time, device_serial_num, file, message) VALUES
(1, 'Первоначальная настройка', '2002-06-15 14:30:00', 'RS101016430001', 'config_rs001.txt', 'Устройство успешно сконфигурировано'),
(2, 'Обновление прошивки', '2003-07-20 15:00:00', 'RS102016430002', 'firmware_update.log', 'Прошивка обновлена до версии 1.3'),
(3, 'Калибровка портов', '2004-03-10 14:45:00', 'RS103016430003', 'calibration.log', 'Калибровка выполнена успешно'),
(4, 'Проверка безопасности', '2005-09-25 16:30:00', 'RS104016430004', 'security_check.log', 'Уязвимостей не обнаружено'),
(5, 'Настройка VPN', '2006-05-18 15:15:00', 'RS105016430005', 'vpn_config.txt', 'VPN настроен успешно'),
(6, 'Мониторинг производительности', '2007-02-12 14:45:00', 'RS106016430006', 'perf_monitor.log', 'Производительность в норме'),
(7, 'Обновление ПО', '2008-08-05 16:00:00', 'RS107016430007', 'update_6.4.log', 'Обновление успешно'),
(8, 'Настройка маршрутизации', '2009-04-15 15:30:00', 'RS108016430008', 'routing_config.txt', 'Маршруты настроены'),
(9, 'Диагностика сети', '2010-10-20 17:15:00', 'RS109016430009', 'network_diag.log', 'Сеть функционирует нормально'),
(10, 'Резервное копирование', '2011-01-25 16:45:00', 'RS110016430010', 'backup_config.bin', 'Конфигурация сохранена'),
(11, 'Обновление безопасности', '2012-11-30 15:30:00', 'RS111016430011', 'security_update.log', 'Обновление установлено'),
(12, 'Плановая проверка', '2013-05-15 17:00:00', 'RS112016430012', 'annual_check.log', 'Все параметры в норме'),
(13, 'Первоначальная настройка PoE', '2023-01-15 15:30:00', 'SA101026430001', 'poe_config.txt', 'PoE сконфигурирован для всех портов'),
(14, 'Тестирование производительности', '2023-02-20 16:00:00', 'SA101026430002', 'performance_test.log', 'Пропускная способность в норме'),
(15, 'Настройка VLAN', '2023-03-10 15:45:00', 'SA101026430003', 'vlan_config.txt', 'Настроено 32 VLAN'),
(16, 'Обновление прошивки', '2023-04-18 17:30:00', 'SA101026430004', 'firmware_update.log', 'Прошивка обновлена'),
(17, 'Проверка PoE', '2023-05-22 16:15:00', 'SA101026430005', 'poe_test.log', 'PoE работает корректно'),
(18, 'Настройка VLAN', '2023-04-05 17:30:00', 'SA102026430006', 'vlan_config.txt', 'Настроено 16 VLAN'),
(19, 'Тестирование портов', '2023-05-12 16:30:00', 'SA102026430007', 'port_test.log', 'Все порты работают'),
(20, 'Обновление ПО', '2023-06-18 17:45:00', 'SA102026430008', 'update_4.0.log', 'Обновление до версии 4.0 успешно'),
(21, 'Настройка QoS', '2023-07-25 16:00:00', 'SA102026430009', 'qos_config.txt', 'QoS настроен'),
(22, 'Проверка безопасности', '2023-08-14 17:30:00', 'SA102026430010', 'security_check.log', 'Безопасность в норме'),
(23, 'Настройка агрегации', '2023-07-22 16:45:00', 'SA103026430011', 'lag_config.txt', 'Link aggregation настроен'),
(24, 'Мониторинг сети', '2023-08-30 17:15:00', 'SA103026430012', 'monitoring.log', 'Сеть стабильна'),
(25, 'Обновление драйверов', '2023-09-15 16:30:00', 'SA103026430013', 'driver_update.log', 'Драйверы обновлены'),
(26, 'Первоначальная настройка', '2024-01-10 16:30:00', 'SA101026430014', 'initial_config.txt', 'Устройство готово к работе'),
(27, 'Тестирование PoE', '2024-02-15 17:15:00', 'SA102026430015', 'poe_test.log', 'PoE функционирует'),
(28, 'Настройка BGP', '2021-03-10 16:30:00', 'RB101026430001', 'bgp_config.txt', 'BGP настроен'),
(29, 'Обновление прошивки', '2022-06-20 17:00:00', 'RB102026430002', 'firmware_update.log', 'Прошивка обновлена'),
(30, 'Проверка маршрутизации', '2023-09-05 16:45:00', 'RB103026430003', 'routing_check.log', 'Маршрутизация работает');

-- Добавление информации о ремонтах
INSERT INTO repair (device_id, date_time, date_time_repair, device_serial_num, message) VALUES
(3, '2005-06-10 10:00:00', '2005-06-12 14:00:00', 'RS103016430003', 'Замена блока питания'),
(5, '2008-03-15 11:30:00', '2008-03-16 16:30:00', 'RS105016430005', 'Профилактическое обслуживание'),
(11, '2014-05-20 09:00:00', '2014-05-21 13:00:00', 'RS111016430011', 'Замена вентилятора'),
(19, '2023-08-01 09:00:00', '2023-08-02 13:00:00', 'SA102026430007', 'Калибровка PoE портов'),
(24, '2023-11-10 10:30:00', '2023-11-11 15:30:00', 'SA103026430012', 'Замена блока питания'),
(29, '2023-12-05 11:00:00', '2023-12-06 16:00:00', 'RB102026430002', 'Профилактическое обслуживание');

-- Добавление ошибок устройств
INSERT INTO device_error (device_id, date, debug_info, error_code, ip, serial_num, stand, status) VALUES
(3, '2005-06-10', 'Power supply failure', 'ERR-001', '192.168.1.103', 'RS103016430003', 'Стенд 3', false),
(5, '2008-03-15', 'Overheating warning', 'ERR-002', '192.168.1.105', 'RS105016430005', 'Стенд 5', true),
(11, '2014-05-20', 'Fan failure', 'ERR-003', '192.168.1.111', 'RS111016430011', 'Стенд 11', false),
(19, '2023-08-01', 'PoE port 5 overcurrent', 'ERR-023', '192.168.1.119', 'SA102026430007', 'Стенд Б-6', true),
(24, '2023-11-10', 'Power supply fluctuation', 'ERR-031', '192.168.1.124', 'SA103026430012', 'Стенд В-4', false),
(29, '2023-12-05', 'High temperature warning', 'ERR-045', '192.168.1.129', 'RB102026430002', 'Стенд Г-2', true),
(15, '2023-06-15', 'Port 12 link down', 'ERR-012', '192.168.1.115', 'SA101026430003', 'Стенд А-15', true),
(22, '2023-09-20', 'Memory usage high', 'ERR-078', '192.168.1.122', 'SA102026430010', 'Стенд Б-9', true);

-- Добавление Xray данных
INSERT INTO xray (device_id, file, serial_num) VALUES
(1, 'xray_rs001_2002.jpg', 'XR00123001'),
(2, 'xray_rs002_2003.jpg', 'XR00123002'),
(3, 'xray_rs003_2004.jpg', 'XR00123003'),
(4, 'xray_rs004_2005.jpg', 'XR00123004'),
(5, 'xray_rs005_2006.jpg', 'XR00123005'),
(6, 'xray_rs006_2007.jpg', 'XR00123006'),
(7, 'xray_rs007_2008.jpg', 'XR00123007'),
(8, 'xray_rs008_2009.jpg', 'XR00123008'),
(9, 'xray_rs009_2010.jpg', 'XR00123009'),
(10, 'xray_rs010_2011.jpg', 'XR00123010'),
(11, 'xray_rs011_2012.jpg', 'XR00123011'),
(12, 'xray_rs012_2013.jpg', 'XR00123012'),
(13, 'xray_sa001_2023.jpg', 'XR00223001'),
(14, 'xray_sa002_2023.jpg', 'XR00223002'),
(15, 'xray_sa003_2023.jpg', 'XR00223003'),
(16, 'xray_sa004_2023.jpg', 'XR00223004'),
(17, 'xray_sa005_2023.jpg', 'XR00223005'),
(18, 'xray_sa006_2023.jpg', 'XR00223006'),
(19, 'xray_sa007_2023.jpg', 'XR00223007'),
(20, 'xray_sa008_2023.jpg', 'XR00223008'),
(21, 'xray_sa009_2023.jpg', 'XR00223009'),
(22, 'xray_sa010_2023.jpg', 'XR00223010'),
(23, 'xray_sa011_2023.jpg', 'XR00223011'),
(24, 'xray_sa012_2023.jpg', 'XR00223012'),
(25, 'xray_sa013_2023.jpg', 'XR00223013'),
(26, 'xray_sa014_2024.jpg', 'XR00223014'),
(27, 'xray_sa015_2024.jpg', 'XR00223015'),
(28, 'xray_rb001_2021.jpg', 'XR00323001'),
(29, 'xray_rb002_2022.jpg', 'XR00323002'),
(30, 'xray_rb003_2023.jpg', 'XR00323003');

-- Вывод информации о количестве добавленных записей
SELECT 'БД успешно создана и заполнена!' as 'Статус';
SELECT COUNT(*) as 'Всего устройств' FROM devices;
SELECT COUNT(*) as 'Маршрутизаторов RS' FROM devices WHERE device_type_id = (SELECT id FROM device_type WHERE code = 'RS');
SELECT COUNT(*) as 'Маршрутизаторов RB' FROM devices WHERE device_type_id = (SELECT id FROM device_type WHERE code = 'RB');
SELECT COUNT(*) as 'Коммутаторов доступа' FROM devices WHERE device_type_id = (SELECT id FROM device_type WHERE code = 'SA');
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