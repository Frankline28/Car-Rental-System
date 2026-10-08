-- MANUAL MIGRATION — NOT RUN AUTOMATICALLY BY SPRING OR A MIGRATION FRAMEWORK.
-- Take a backup and review the target schema before execution. Run with the
-- MySQL CLI; the integrity checks and DDL are in one procedure so a failed
-- preflight aborts before any constraint is changed.

DELIMITER $$
DROP PROCEDURE IF EXISTS phase6_harden_booking_constraints$$
CREATE PROCEDURE phase6_harden_booking_constraints()
BEGIN
    IF EXISTS (
        SELECT 1 FROM bookings b
        LEFT JOIN users u ON u.id = b.user_id
        WHERE b.user_id IS NULL OR u.id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot harden bookings: user_id is null or orphaned';
    END IF;

    IF EXISTS (
        SELECT 1 FROM bookings b
        LEFT JOIN cars c ON c.id = b.car_id
        WHERE b.car_id IS NULL OR c.id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot harden bookings: car_id is null or orphaned';
    END IF;

    IF EXISTS (
        SELECT 1 FROM bookings b
        LEFT JOIN packages p ON p.id = b.package_id
        WHERE b.package_id IS NULL OR p.id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot harden bookings: package_id is null or orphaned';
    END IF;

    IF EXISTS (
        SELECT 1 FROM bookings b
        LEFT JOIN locations l ON l.id = b.pickup_location_id
        WHERE b.pickup_location_id IS NULL OR l.id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot harden bookings: pickup_location_id is null or orphaned';
    END IF;

    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE quantity IS NULL OR start_at IS NULL OR end_at IS NULL OR amount IS NULL
           OR payment_method IS NULL OR payment_status IS NULL OR status IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot harden bookings: required booking values are null';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.key_column_usage
        WHERE constraint_schema = DATABASE() AND table_name = 'bookings'
          AND column_name = 'user_id' AND referenced_table_name = 'users'
          AND referenced_column_name = 'id'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.key_column_usage
        WHERE constraint_schema = DATABASE() AND table_name = 'bookings'
          AND column_name = 'car_id' AND referenced_table_name = 'cars'
          AND referenced_column_name = 'id'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_bookings_car
            FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE RESTRICT;
    END IF;

    ALTER TABLE bookings
        MODIFY user_id BIGINT NOT NULL,
        MODIFY car_id BIGINT NOT NULL,
        MODIFY package_id VARCHAR(36) NOT NULL,
        MODIFY pickup_location_id BIGINT NOT NULL,
        MODIFY quantity INT NOT NULL,
        MODIFY start_at DATETIME(6) NOT NULL,
        MODIFY end_at DATETIME(6) NOT NULL,
        MODIFY amount DECIMAL(12,2) NOT NULL,
        MODIFY payment_method ENUM('CARD','CASH','WALLET') NOT NULL,
        MODIFY payment_status ENUM('PAID','PENDING','REFUNDED','REFUND_PENDING') NOT NULL;
END$$

CALL phase6_harden_booking_constraints()$$
DROP PROCEDURE phase6_harden_booking_constraints$$
DELIMITER ;

-- status is already NOT NULL in the audited schema. created_at and updated_at
-- remain nullable because legacy rows and entity lifecycle callbacks may omit them.
