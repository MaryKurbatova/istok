CREATE DATABASE IF NOT EXISTS istok;
USE istok;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS packaging_records;
DROP TABLE IF EXISTS psi_records;
DROP TABLE IF EXISTS assembly_records;
DROP TABLE IF EXISTS diagnostics_records;
DROP TABLE IF EXISTS visual_inspection_records;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS board_type;
DROP TABLE IF EXISTS repair;
DROP TABLE IF EXISTS device_error;
DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS statistic;
DROP TABLE IF EXISTS macs;
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

CREATE TABLE board_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT
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
    product_serial_number VARCHAR(100) UNIQUE,
    case_serial_number VARCHAR(255),
    monthly_sequence VARCHAR(10),
    manufactures_date VARCHAR(255),
    type VARCHAR(255),
    version_os VARCHAR(255),
    diag BOOLEAN DEFAULT FALSE,
    image_path VARCHAR(500),
    assembly_passed BOOLEAN DEFAULT FALSE,
    assembly_date DATETIME,
    assembly_employee_id BIGINT,
    assembly_comment TEXT,
    psi_passed BOOLEAN DEFAULT FALSE,
    psi_date DATETIME,
    psi_employee_id BIGINT,
    psi_comment TEXT,
    psi_protocol_number VARCHAR(100),
    psi_firmware_version VARCHAR(255),
    packaging_passed BOOLEAN DEFAULT FALSE,
    packaging_date DATETIME,
    packaging_employee_id BIGINT,
    packaging_comment TEXT,
    passport_printed BOOLEAN DEFAULT FALSE,
    label_printed BOOLEAN DEFAULT FALSE,
    current_stage VARCHAR(50) DEFAULT 'new',
    date_time_package VARCHAR(255),
    date_time_pci VARCHAR(255),
    FOREIGN KEY (device_type_id) REFERENCES device_type(id),
    FOREIGN KEY (place_of_production_id) REFERENCES place_of_production(id),
    FOREIGN KEY (production_month_id) REFERENCES production_month(id),
    FOREIGN KEY (production_year_id) REFERENCES production_year(id),
    FOREIGN KEY (production_stage_id) REFERENCES production_stage(id),
    FOREIGN KEY (actual_location_id) REFERENCES location(id),
    FOREIGN KEY (bmc_id) REFERENCES bmc(id),
    FOREIGN KEY (uboot_id) REFERENCES uboot(id),
    FOREIGN KEY (iso_id) REFERENCES iso(id),
    FOREIGN KEY (assembly_employee_id) REFERENCES employees(id),
    FOREIGN KEY (psi_employee_id) REFERENCES employees(id),
    FOREIGN KEY (packaging_employee_id) REFERENCES employees(id)
);

CREATE TABLE boards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_type_id BIGINT NOT NULL,
    serial_number VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_stage VARCHAR(50) DEFAULT 'new',
    visual_inspection_passed BOOLEAN DEFAULT FALSE,
    visual_inspection_date DATETIME,
    visual_inspection_employee_id BIGINT,
    visual_inspection_comment TEXT,
    diagnostics_passed BOOLEAN DEFAULT FALSE,
    diagnostics_date DATETIME,
    diagnostics_employee_id BIGINT,
    diagnostics_comment TEXT,
    diagnostics_ip VARCHAR(50),
    diagnostics_stand VARCHAR(100),
    assembly_passed BOOLEAN DEFAULT FALSE,
    assembly_date DATETIME,
    assembly_employee_id BIGINT,
    device_id BIGINT,
    FOREIGN KEY (board_type_id) REFERENCES board_type(id),
    FOREIGN KEY (visual_inspection_employee_id) REFERENCES employees(id),
    FOREIGN KEY (diagnostics_employee_id) REFERENCES employees(id),
    FOREIGN KEY (assembly_employee_id) REFERENCES employees(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE macs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    mac_address VARCHAR(17) NOT NULL UNIQUE,
    interface_name VARCHAR(50),
    assignment_date DATE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE visual_inspection_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    inspection_date DATETIME NOT NULL,
    result BOOLEAN NOT NULL,
    comment TEXT,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE diagnostics_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    diagnostics_date DATETIME NOT NULL,
    result BOOLEAN NOT NULL,
    comment TEXT,
    ip_address VARCHAR(50),
    stand_name VARCHAR(100),
    ports_ok BOOLEAN DEFAULT FALSE,
    os_installed BOOLEAN DEFAULT FALSE,
    disks_ok BOOLEAN DEFAULT FALSE,
    memory_ok BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE assembly_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    assembly_date DATETIME NOT NULL,
    case_serial_number VARCHAR(255),
    comment TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE psi_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    psi_date DATETIME NOT NULL,
    result BOOLEAN NOT NULL,
    protocol_number VARCHAR(100),
    firmware_version VARCHAR(255),
    comment TEXT,
    ports_ok BOOLEAN DEFAULT FALSE,
    os_installed BOOLEAN DEFAULT FALSE,
    disks_ok BOOLEAN DEFAULT FALSE,
    memory_ok BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE packaging_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    packaging_date DATETIME NOT NULL,
    passport_printed BOOLEAN DEFAULT FALSE,
    label_printed BOOLEAN DEFAULT FALSE,
    comment TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT,
    board_id BIGINT,
    commentary VARCHAR(500),
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    serial_num VARCHAR(255),
    message VARCHAR(500),
    stage VARCHAR(50),
    employee_id BIGINT,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE device_error (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT,
    board_id BIGINT,
    date VARCHAR(255),
    debug_info VARCHAR(500),
    error_code VARCHAR(255),
    ip VARCHAR(255),
    serial_num VARCHAR(255),
    stand VARCHAR(255),
    status BOOLEAN,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE repair (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT,
    board_id BIGINT,
    date_time VARCHAR(255),
    date_time_repair VARCHAR(255),
    serial_num VARCHAR(255),
    message VARCHAR(500),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
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

SET FOREIGN_KEY_CHECKS = 1;

-- ========== DATA ==========

INSERT INTO device_type (name, code) VALUES
('Сервисный маршрутизатор', 'RS'),
('Коммутатор доступа', 'SA');

INSERT INTO board_type (code, name, description) VALUES
('MAIN', 'Плата основная', 'Основная плата с процессором'),
('POWER', 'Плата питания', 'Блок питания'),
('SCREEN', 'Плата экрана', 'Управление дисплеем'),
('ADAPTER', 'Плата переходная', 'Модули расширения');

INSERT INTO production_month (code, name) VALUES
('1','Январь'),('2','Февраль'),('3','Март'),('4','Апрель'),
('5','Май'),('6','Июнь'),('7','Июль'),('8','Август'),
('9','Сентябрь'),('10','Октябрь'),('11','Ноябрь'),('12','Декабрь');

INSERT INTO production_year (code, name) VALUES
('1','2002'),('2','2003'),('3','2004'),('4','2005'),('5','2006'),
('6','2007'),('7','2008'),('8','2009'),('9','2010'),('10','2011'),
('11','2012'),('12','2013'),('13','2014'),('14','2015'),('15','2016'),
('16','2017'),('17','2018'),('18','2019'),('19','2020'),('20','2021'),
('21','2022'),('22','2023'),('23','2024'),('24','2025');

INSERT INTO production_stage (code, name, description) VALUES
('1','Опытный образец','опытный образец'),
('2','Опытный образец','опытный образец'),
('3','testing','отладочная партия'),
('4','testing','отладочная партия'),
('5','production','серийное производство');

INSERT INTO place_of_production (code, name) VALUES
('00','неопределено'),('01','АО НПП Исток'),('02','ООО EMC-Эксперт'),
('10','АО НПП Исток ПТК-7'),('12','АО НПП Исток НТК-6'),
('13','АО НПП Исток ПТК-7'),('14','АО НПП Исток НТД-6'),
('16','АО НПП Исток ПТК-6'),('17','АО НПП Исток Цех №5'),
('18','АО НПП Исток Цех №7');

INSERT INTO location (name) VALUES
('Склад готовой продукции'),('Стенд визуального осмотра'),
('Стенд диагностики'),('Стенд сборки'),('Стенд ПСИ'),
('Стенд упаковки'),('Цех программирования №2'),('Цех программирования №3');

INSERT INTO bmc (file_bmc, version_bmc) VALUES
('bmc_router_v1.2.bin','router_1.2'),('bmc_router_v2.0.bin','router_2.0'),
('bmc_switch_v1.0.bin','switch_1.0'),('bmc_switch_v2.0.bin','switch_2.0');

INSERT INTO uboot (file_uboot, version_uboot) VALUES
('uboot_router_v2022.01','router_2022.01'),('uboot_router_v2023.01','router_2023.01'),
('uboot_switch_v2023.01','switch_2023.01'),('uboot_switch_v2024.01','switch_2024.01');

INSERT INTO iso (file_iso, version_iso) VALUES
('routeros_6.0.iso','router_6.0'),('routeros_6.4.iso','router_6.4'),
('switch_os_3.0.iso','switch_3.0'),('switch_os_4.0.iso','switch_4.0');

INSERT INTO employees (last_name, first_name, middle_name, position, username, password, role) VALUES
('Иванов','Алексей','Петрович','Технолог визуального осмотра','ivanov_a','123','user'),
('Петров','Сергей','Иванович','Технолог диагностики','petrov_s','123','user'),
('Сидоров','Дмитрий','Васильевич','Технолог сборки','sidorov_d','123','user'),
('Кузнецов','Михаил','Александрович','Инженер ПСИ','kuznetsov_m','123','user'),
('Смирнова','Ольга','Викторовна','Технолог упаковки','smirnova_o','123','user'),
('Администратор','Главный','Системович','Главный администратор','admin','admin123','admin'),
('Соколов','Андрей','Викторович','Технолог','sokolov_a','123','user'),
('Оператор','Иван','Петрович','Оператор','operator','123','operator');

-- Платы для устройства 1 (RS)
INSERT INTO boards (board_type_id, serial_number, current_stage, visual_inspection_passed, visual_inspection_date, visual_inspection_employee_id, diagnostics_passed, diagnostics_date, diagnostics_employee_id, assembly_passed, assembly_date, assembly_employee_id) VALUES
(1,'MB-RS-2023-001','assembled',TRUE,'2023-01-10 09:00:00',1,TRUE,'2023-01-11 10:00:00',2,TRUE,'2023-01-12 11:00:00',3),
(2,'PB-RS-2023-001','assembled',TRUE,'2023-01-10 09:30:00',1,TRUE,'2023-01-11 10:30:00',2,TRUE,'2023-01-12 11:30:00',3),
(3,'SB-RS-2023-001','assembled',TRUE,'2023-01-10 10:00:00',1,TRUE,'2023-01-11 11:00:00',2,TRUE,'2023-01-12 12:00:00',3),
(4,'AB-RS-2023-001','assembled',TRUE,'2023-01-10 10:30:00',1,TRUE,'2023-01-11 11:30:00',2,TRUE,'2023-01-12 12:30:00',3);

-- Платы для устройства 2 (RS)
INSERT INTO boards (board_type_id, serial_number, current_stage, visual_inspection_passed, visual_inspection_date, visual_inspection_employee_id, diagnostics_passed, diagnostics_date, diagnostics_employee_id, assembly_passed, assembly_date, assembly_employee_id) VALUES
(1,'MB-RS-2023-002','assembled',TRUE,'2023-02-10 09:00:00',1,TRUE,'2023-02-11 10:00:00',2,TRUE,'2023-02-12 11:00:00',3),
(2,'PB-RS-2023-002','assembled',TRUE,'2023-02-10 09:30:00',1,TRUE,'2023-02-11 10:30:00',2,TRUE,'2023-02-12 11:30:00',3),
(3,'SB-RS-2023-002','assembled',TRUE,'2023-02-10 10:00:00',1,TRUE,'2023-02-11 11:00:00',2,TRUE,'2023-02-12 12:00:00',3),
(4,'AB-RS-2023-002','assembled',TRUE,'2023-02-10 10:30:00',1,TRUE,'2023-02-11 11:30:00',2,TRUE,'2023-02-12 12:30:00',3);

-- Платы для SA коммутатора 1
INSERT INTO boards (board_type_id, serial_number, current_stage, visual_inspection_passed, visual_inspection_date, visual_inspection_employee_id, diagnostics_passed, diagnostics_date, diagnostics_employee_id, assembly_passed, assembly_date, assembly_employee_id) VALUES
(1,'MB-SA-2023-001','assembled',TRUE,'2023-03-10 09:00:00',7,TRUE,'2023-03-11 10:00:00',2,TRUE,'2023-03-12 11:00:00',3),
(2,'PB-SA-2023-001','assembled',TRUE,'2023-03-10 09:30:00',7,TRUE,'2023-03-11 10:30:00',2,TRUE,'2023-03-12 11:30:00',3),
(4,'AB-SA-2023-001','assembled',TRUE,'2023-03-10 10:00:00',7,TRUE,'2023-03-11 11:00:00',2,TRUE,'2023-03-12 12:00:00',3);

-- Платы SA 2
INSERT INTO boards (board_type_id, serial_number, current_stage, visual_inspection_passed, visual_inspection_date, visual_inspection_employee_id, diagnostics_passed, diagnostics_date, diagnostics_employee_id, assembly_passed, assembly_date, assembly_employee_id) VALUES
(1,'MB-SA-2023-002','assembled',TRUE,'2023-04-10 09:00:00',7,TRUE,'2023-04-11 10:00:00',2,TRUE,'2023-04-12 11:00:00',3),
(2,'PB-SA-2023-002','assembled',TRUE,'2023-04-10 09:30:00',7,TRUE,'2023-04-11 10:30:00',2,TRUE,'2023-04-12 11:30:00',3);

-- Новые платы
INSERT INTO boards (board_type_id, serial_number, current_stage) VALUES
(1,'MB-RS-2024-010','new'),(2,'PB-RS-2024-010','new'),
(3,'SB-RS-2024-010','new'),(4,'AB-RS-2024-010','new'),
(1,'MB-SA-2024-010','new'),(2,'PB-SA-2024-010','new');

-- Осмотренные платы
INSERT INTO boards (board_type_id, serial_number, current_stage, visual_inspection_passed, visual_inspection_date, visual_inspection_employee_id) VALUES
(1,'MB-RS-2024-020','visual_ok',TRUE,'2024-06-01 09:00:00',1),
(2,'PB-RS-2024-020','visual_ok',TRUE,'2024-06-01 09:30:00',1),
(3,'SB-RS-2024-020','visual_ok',TRUE,'2024-06-01 10:00:00',1),
(4,'AB-RS-2024-020','visual_ok',TRUE,'2024-06-01 10:30:00',1);

-- Устройства
INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, image_path, current_stage,
    assembly_passed, assembly_date, assembly_employee_id,
    psi_passed, psi_date, psi_employee_id, psi_protocol_number, psi_firmware_version,
    packaging_passed, packaging_date, packaging_employee_id, passport_printed, label_printed
) VALUES
(1,4,1,22,5,1,2,2,2,'RS501175220001','001','2023-01-15','ISN41508T3','RouterOS 6.4',TRUE,'/images/ISN41508T3.png','packaged',
 TRUE,'2023-01-12 14:00:00',3,TRUE,'2023-01-13 16:00:00',4,'PSI-2023-001','router_6.4',
 TRUE,'2023-01-14 10:00:00',5,TRUE,TRUE),

(1,5,2,22,5,5,2,2,2,'RS501175220002','002','2023-02-20','ISN41508T3-M','RouterOS 6.4',TRUE,'/images/ISN41508T3-M.png','psi_ok',
 TRUE,'2023-02-12 14:00:00',3,TRUE,'2023-02-13 16:00:00',4,'PSI-2023-002','router_6.4',
 FALSE,NULL,NULL,FALSE,FALSE),

(2,7,3,22,5,1,4,4,4,'SA501175220001','001','2023-03-15','ISN41508T4','SwitchOS 4.0',TRUE,'/images/ISN41508T4.png','packaged',
 TRUE,'2023-03-12 14:00:00',3,TRUE,'2023-03-13 16:00:00',4,'PSI-2023-003','switch_4.0',
 TRUE,'2023-03-14 10:00:00',5,TRUE,TRUE),

(2,8,4,22,5,4,4,4,4,'SA501175220002','002','2023-04-20','ISN41508T3-M-AC','SwitchOS 4.0',TRUE,'/images/ISN41508T3-M-AC.png','assembled',
 TRUE,'2023-04-12 14:00:00',3,FALSE,NULL,NULL,NULL,NULL,
 FALSE,NULL,NULL,FALSE,FALSE);

-- Привязка плат
UPDATE boards SET device_id=1 WHERE serial_number IN ('MB-RS-2023-001','PB-RS-2023-001','SB-RS-2023-001','AB-RS-2023-001');
UPDATE boards SET device_id=2 WHERE serial_number IN ('MB-RS-2023-002','PB-RS-2023-002','SB-RS-2023-002','AB-RS-2023-002');
UPDATE boards SET device_id=3 WHERE serial_number IN ('MB-SA-2023-001','PB-SA-2023-001','AB-SA-2023-001');
UPDATE boards SET device_id=4 WHERE serial_number IN ('MB-SA-2023-002','PB-SA-2023-002');

-- MAC
INSERT INTO macs (device_id, mac_address, interface_name, assignment_date) VALUES
(1,'00:1B:44:11:3A:B7','eth0','2023-01-15'),(1,'00:1B:44:11:3A:B8','eth1','2023-01-15'),
(2,'00:1B:44:11:3A:B9','eth0','2023-02-20'),(2,'00:1B:44:11:3A:BA','eth1','2023-02-20'),
(3,'00:1C:44:11:3A:D1','eth0','2023-03-15'),(3,'00:1C:44:11:3A:D2','eth1','2023-03-15'),
(3,'00:1C:44:11:3A:D3','management','2023-03-15'),
(4,'00:1C:44:11:3A:E1','eth0','2023-04-20'),(4,'00:1C:44:11:3A:E2','eth1','2023-04-20');

-- Журналы
INSERT INTO visual_inspection_records (board_id, employee_id, inspection_date, result, comment) VALUES
(1,1,'2023-01-10 09:00:00',TRUE,'OK'),(2,1,'2023-01-10 09:30:00',TRUE,'OK'),
(3,1,'2023-01-10 10:00:00',TRUE,'OK'),(4,1,'2023-01-10 10:30:00',TRUE,'OK');

INSERT INTO diagnostics_records (board_id, employee_id, diagnostics_date, result, comment, ip_address, stand_name, ports_ok, os_installed, disks_ok, memory_ok) VALUES
(1,2,'2023-01-11 10:00:00',TRUE,'Все ОК','192.168.1.101','Стенд Д-1',TRUE,TRUE,TRUE,TRUE),
(2,2,'2023-01-11 10:30:00',TRUE,'OK','192.168.1.102','Стенд Д-1',TRUE,TRUE,TRUE,TRUE);

INSERT INTO assembly_records (device_id, employee_id, assembly_date, case_serial_number, comment) VALUES
(1,3,'2023-01-12 14:00:00','CASE-RS-2023-001','Сборка OK'),
(2,3,'2023-02-12 14:00:00','CASE-RS-2023-002','OK'),
(3,3,'2023-03-12 14:00:00','CASE-SA-2023-001','OK'),
(4,3,'2023-04-12 14:00:00','CASE-SA-2023-002','OK');

INSERT INTO psi_records (device_id, employee_id, psi_date, result, protocol_number, firmware_version, comment, ports_ok, os_installed, disks_ok, memory_ok) VALUES
(1,4,'2023-01-13 16:00:00',TRUE,'PSI-2023-001','router_6.4','Все тесты OK',TRUE,TRUE,TRUE,TRUE),
(2,4,'2023-02-13 16:00:00',TRUE,'PSI-2023-002','router_6.4','OK',TRUE,TRUE,TRUE,TRUE),
(3,4,'2023-03-13 16:00:00',TRUE,'PSI-2023-003','switch_4.0','OK',TRUE,TRUE,TRUE,TRUE);

INSERT INTO packaging_records (device_id, employee_id, packaging_date, passport_printed, label_printed, comment) VALUES
(1,5,'2023-01-14 10:00:00',TRUE,TRUE,'Упаковка OK'),
(3,5,'2023-03-14 10:00:00',TRUE,TRUE,'OK');

INSERT INTO history (device_id, serial_num, message, stage, employee_id, date_time) VALUES
(1,'RS501175220001','Полный цикл завершён','packaged',5,'2023-01-14 12:00:00'),
(2,'RS501175220002','Ожидает упаковки','psi_ok',4,'2023-02-13 17:00:00');

SELECT 'БД создана!' as status;
SELECT COUNT(*) as devices FROM devices;
SELECT COUNT(*) as boards FROM boards;
SELECT COUNT(*) as employees FROM employees;