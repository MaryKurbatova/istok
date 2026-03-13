create database istok;
use istok;
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
    position VARCHAR(100) NOT NULL
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

CREATE TABLE macs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    mac_address VARCHAR(17) NOT NULL UNIQUE,
    interface_name VARCHAR(50),
    assignment_date DATE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE serial_num_board (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    error_code VARCHAR(255),
    serial_num_board VARCHAR(255),
    visual_inspection BOOLEAN,
    visual_inspection_author VARCHAR(255),
    visual_inspection_datetime VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE serial_num_pcb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_pcb VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE serial_num_router (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_router VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE serial_num_pki (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_pki VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE serial_num_bp (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_bp VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE serial_num_package (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_package VARCHAR(255),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE TABLE serial_num_case (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNIQUE NOT NULL,
    serial_num_case VARCHAR(255),
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

-- Вставка данных
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
('6', 'Июнь'), ('1', 'Январь'), ('7', 'Июль'), ('2', 'Февраль'), 
('8', 'Август'), ('3', 'Март'), ('9', 'Сентябрь'), ('4', 'Апрель'), 
('10', 'Октябрь'), ('5', 'Май'), ('11', 'Ноябрь'), ('12', 'Декабрь');

INSERT INTO production_year (code, name) VALUES
('1', '2002'), ('2', '2003'), ('3', '2004'), ('4', '2005'), ('5', '2006'),
('6', '2007'), ('7', '2008'), ('8', '2009'), ('9', '2010'), ('10', '2011');

INSERT INTO production_stage (code, name, description) VALUES
('7', 'фосфузе', 'опытный образец'),
('6', 'фосфузе', 'опытный образец'),
('1', 'testing', 'отладочная партия'),
('2', 'testing', 'отладочная партия'),
('3', 'production', 'серийное производство');

INSERT INTO place_of_production (code, name) VALUES
('00', 'неопределено'), ('01', 'АО НПП Исток'), ('02', 'ООО EMC-Эксперт'), 
('10', 'АО НПП Исток ПТК-7'), ('12', 'АО НПП Исток НТК-6'), 
('13', 'АО НПП Исток ПТК-7'), ('14', 'АО НПП Исток НТД-6'), 
('16', 'АО НПП Исток ПТК-6');

INSERT INTO location (name) VALUES
('Склад готовой продукции'), ('Цех сборки №1'), ('Цех диагностики'), 
('Лаборатория ПСИ'), ('Упаковочный цех');

INSERT INTO bmc (file_bmc, version_bmc) VALUES
('bmc_v1.2.bin', '1.2'), ('bmc_v1.3.bin', '1.3'), ('bmc_v1.4.bin', '1.4'),
('bmc_v1.5.bin', '1.5'), ('bmc_v2.0.bin', '2.0');

INSERT INTO uboot (file_uboot, version_uboot) VALUES
('uboot_v2022.01', '2022.01'), ('uboot_v2022.04', '2022.04'), 
('uboot_v2023.01', '2023.01'), ('uboot_v2023.04', '2023.04');

INSERT INTO iso (file_iso, version_iso) VALUES
('routeros_6.0.iso', '6.0'), ('routeros_6.1.iso', '6.1'), 
('routeros_6.2.iso', '6.2'), ('routeros_6.3.iso', '6.3'), 
('routeros_6.4.iso', '6.4');

INSERT INTO employees (last_name, first_name, middle_name, position) VALUES
('Иванов', 'Алексей', 'Петрович', 'Сборщик'),
('Петров', 'Сергей', 'Иванович', 'Сборщик'),
('Сидоров', 'Дмитрий', 'Васильевич', 'Электрик'),
('Кузнецов', 'Михаил', 'Александрович', 'Электрик'),
('Смирнова', 'Ольга', 'Викторовна', 'Инженер ПСИ');

INSERT INTO devices (
    device_type_id, place_of_production_id, production_month_id, production_year_id,
    production_stage_id, actual_location_id, bmc_id, uboot_id, iso_id,
    product_serial_number, monthly_sequence, manufactures_date, type,
    version_os, diag, date_time_package, date_time_pci
) VALUES
(
    1, 4, 1, 1, 4, 1, 1, 1, 1,
    'RS101016430001', '001', '2002-06-15', 'ISN4150873 +10n',
    'RouterOS 6.0', true, '2002-06-15 10:00:00', '2002-06-15 14:00:00'
),
(
    1, 5, 3, 2, 4, 1, 2, 2, 2,
    'RS102016430002', '002', '2003-07-20', 'ISN4150873 +10n',
    'RouterOS 6.1', true, '2003-07-20 10:00:00', '2003-07-20 14:00:00'
),
(
    1, 6, 4, 3, 4, 1, 3, 3, 3,
    'RS103016430003', '003', '2004-03-10', 'ISN4150873 +10n',
    'RouterOS 6.2', true, '2004-03-10 10:00:00', '2004-03-10 14:00:00'
),
(
    1, 7, 7, 4, 4, 1, 4, 4, 4,
    'RS104016430004', '004', '2005-09-25', 'ISN4150873 +10n',
    'RouterOS 6.3', true, '2005-09-25 10:00:00', '2005-09-25 14:00:00'
),
(
    1, 8, 10, 5, 4, 1, 5, 1, 5,
    'RS105016430005', '005', '2006-05-18', 'ISN4150873 +10n',
    'RouterOS 6.4', true, '2006-05-18 10:00:00', '2006-05-18 14:00:00'
);

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
(5, '00:1B:44:11:3A:C0', 'eth1', '2006-05-18');

INSERT INTO serial_num_board (device_id, serial_num_board, visual_inspection, visual_inspection_author, visual_inspection_datetime) VALUES
(1, 'SNB00123001', true, 'Иванов А.П.', '2002-06-10 10:00:00'),
(2, 'SNB00123002', true, 'Петров С.И.', '2003-07-15 11:30:00'),
(3, 'SNB00123003', true, 'Иванов А.П.', '2004-03-05 09:45:00'),
(4, 'SNB00123004', true, 'Петров С.И.', '2005-09-20 14:20:00'),
(5, 'SNB00123005', true, 'Иванов А.П.', '2006-05-12 16:10:00');

INSERT INTO serial_num_pcb (device_id, serial_num_pcb) VALUES
(1, 'PCBSN00123001'), (2, 'PCBSN00123002'), (3, 'PCBSN00123003'),
(4, 'PCBSN00123004'), (5, 'PCBSN00123005');

INSERT INTO serial_num_router (device_id, serial_num_router) VALUES
(1, 'ROUTER00123001'), (2, 'ROUTER00123002'), (3, 'ROUTER00123003'),
(4, 'ROUTER00123004'), (5, 'ROUTER00123005');

INSERT INTO serial_num_package (device_id, serial_num_package) VALUES
(1, 'PKG00123001'), (2, 'PKG00123002'), (3, 'PKG00123003'),
(4, 'PKG00123004'), (5, 'PKG00123005');

INSERT INTO serial_num_case (device_id, serial_num_case) VALUES
(1, 'CASE00123001'), (2, 'CASE00123002'), (3, 'CASE00123003'),
(4, 'CASE00123004'), (5, 'CASE00123005');

INSERT INTO serial_num_bp (device_id, serial_num_bp) VALUES
(1, 'BP00123001'), (2, 'BP00123002'), (3, 'BP00123003'),
(4, 'BP00123004'), (5, 'BP00123005');

INSERT INTO serial_num_pki (device_id, serial_num_pki) VALUES
(1, 'PKI00123001'), (2, 'PKI00123002'), (3, 'PKI00123003'),
(4, 'PKI00123004'), (5, 'PKI00123005');

UPDATE devices SET 
    eth1addr_id = (SELECT id FROM macs WHERE device_id = devices.id AND interface_name = 'eth0' LIMIT 1),
    eth2addr_id = (SELECT id FROM macs WHERE device_id = devices.id AND interface_name = 'eth1' LIMIT 1),
    ethaddr_id = (SELECT id FROM macs WHERE device_id = devices.id AND interface_name = 'eth0' LIMIT 1),
    serial_num_board_id = (SELECT id FROM serial_num_board WHERE device_id = devices.id LIMIT 1),
    serial_num_pcb_id = (SELECT id FROM serial_num_pcb WHERE device_id = devices.id LIMIT 1),
    serial_num_router_id = (SELECT id FROM serial_num_router WHERE device_id = devices.id LIMIT 1),
    serial_num_package_id = (SELECT id FROM serial_num_package WHERE device_id = devices.id LIMIT 1),
    serial_num_case_id = (SELECT id FROM serial_num_case WHERE device_id = devices.id LIMIT 1),
    serial_num_bp_id = (SELECT id FROM serial_num_bp WHERE device_id = devices.id LIMIT 1),
    serial_num_pki_id = (SELECT id FROM serial_num_pki WHERE device_id = devices.id LIMIT 1)
WHERE id IN (1, 2, 3, 4, 5);

INSERT INTO assemblers (employee_id, device_id, assembly_date) VALUES
(1, 1, '2002-06-12'), (2, 2, '2003-07-17'), (1, 3, '2004-03-07'),
(2, 4, '2005-09-22'), (1, 5, '2006-05-15');

INSERT INTO electricians (employee_id, device_id, diagnosis_date, diagnosis_result) VALUES
(3, 1, '2002-06-13', 'Диагностика пройдена успешно'),
(4, 2, '2003-07-18', 'Все системы функционируют нормально'),
(3, 3, '2004-03-08', 'Диагностика без замечаний'),
(4, 4, '2005-09-23', 'Оборудование соответствует ТУ'),
(3, 5, '2006-05-16', 'Диагностика пройдена');

INSERT INTO psi_tests (employee_id, device_id, test_date, test_result, protocol_number) VALUES
(5, 1, '2002-06-14', 'Испытания пройдены', 'PSI-2002-001'),
(5, 2, '2003-07-19', 'Соответствует требованиям', 'PSI-2003-002'),
(5, 3, '2004-03-09', 'Успешное завершение ПСИ', 'PSI-2004-003'),
(5, 4, '2005-09-24', 'Испытания пройдены', 'PSI-2005-004'),
(5, 5, '2006-05-17', 'Соответствует спецификациям', 'PSI-2006-005');