package com.carrental.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.Arrays;

/** Copies data from the project's previous column-based model into the new relational model. */
@Component
public class LegacyDataMigration {
    private final JdbcTemplate jdbc;
    public LegacyDataMigration(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    public void migrate() {
        if(hasColumn("users","role")) jdbc.update("UPDATE users SET role=UPPER(role) WHERE role IS NOT NULL");
        if(hasColumn("users","status")) jdbc.update("UPDATE users SET status='ACTIVE' WHERE status IS NULL OR status=''");
        migrateCars(); migratePackages(); migrateBookings();
    }
    private void migrateCars() {
        if(!hasTable("cars")) return;
        copy("cars","daily_rate","price_per_day"); copy("cars","hourly_rate","price_per_hour");
        copy("cars","weekly_rate","price_per_weekly"); copy("cars","monthly_rate","price_per_monthly");
        if(hasColumn("cars","quantity")) jdbc.update("UPDATE cars SET quantity=1 WHERE quantity IS NULL OR quantity<1");
        if(hasColumn("cars","location_id")&&hasColumn("cars","location")&&hasTable("locations"))
            jdbc.update("UPDATE cars c JOIN locations l ON LOWER(l.name)=LOWER(c.location) SET c.location_id=l.id WHERE c.location_id IS NULL AND c.location IS NOT NULL");
        if(hasColumn("cars","features")&&hasTable("car_features")) {
            jdbc.query("SELECT id, features FROM cars WHERE features IS NOT NULL AND TRIM(features)<>''", rs -> {
                long carId=rs.getLong("id"); String value=rs.getString("features");
                if(jdbc.queryForObject("SELECT COUNT(*) FROM car_features WHERE car_id=?",Integer.class,carId)==0) {
                    for(String feature: Arrays.stream(value.split(",")).map(String::trim).filter(s->!s.isBlank()).toList())
                        jdbc.update("INSERT INTO car_features(car_id, feature) VALUES (?,?)",carId,feature);
                }
            });
        }
    }
    private void migratePackages() {
        if(!hasTable("packages")||!hasColumn("packages","unit")) return;
        if(hasColumn("packages","multiplier")) jdbc.update("""
            UPDATE packages SET
              unit=CASE LOWER(id) WHEN 'hourly' THEN 'HOUR' WHEN 'daily' THEN 'DAY' WHEN 'weekly' THEN 'WEEK' WHEN 'monthly' THEN 'MONTH' ELSE unit END,
              hours=CASE LOWER(id) WHEN 'hourly' THEN 1 WHEN 'daily' THEN 24 WHEN 'weekly' THEN 168 WHEN 'monthly' THEN 720 ELSE COALESCE(hours,24) END,
              discount=CASE WHEN multiplier IS NOT NULL THEN ROUND((1-multiplier)*100,2) ELSE COALESCE(discount,0) END
            WHERE unit IS NULL OR hours IS NULL OR discount IS NULL
            """);
        else jdbc.update("UPDATE packages SET discount=0 WHERE discount IS NULL");
    }
    private void migrateBookings() {
        if(!hasTable("bookings")) return;
        copyDate("start_date","start_at"); copyDate("end_date","end_at");
        copy("bookings","quantity","duration");
        if(hasColumn("bookings","quantity")) jdbc.update("UPDATE bookings SET quantity=1 WHERE quantity IS NULL OR quantity<1");
        if(hasColumn("bookings","status")) jdbc.update("UPDATE bookings SET status=UPPER(status) WHERE status IS NOT NULL");
        copy("bookings","amount","total_amount");
        if(hasColumn("bookings","payment_method")) jdbc.update("UPDATE bookings SET payment_method=UPPER(payment_method) WHERE payment_method IS NOT NULL");
        if(hasColumn("bookings","payment_status")) jdbc.update("UPDATE bookings SET payment_status='PENDING' WHERE payment_status IS NULL OR payment_status=''");
        if(hasColumn("bookings","created_at")) jdbc.update("UPDATE bookings SET created_at=CURRENT_TIMESTAMP WHERE created_at IS NULL");
        if(hasColumn("bookings","updated_at")) jdbc.update("UPDATE bookings SET updated_at=COALESCE(created_at,CURRENT_TIMESTAMP) WHERE updated_at IS NULL");
        if(hasColumn("bookings","pickup_location_id")&&hasTable("cars"))
            jdbc.update("UPDATE bookings b JOIN cars c ON c.id=b.car_id SET b.pickup_location_id=c.location_id WHERE b.pickup_location_id IS NULL");
    }
    private void copyDate(String source,String target) {
        if(hasColumn("bookings",source)&&hasColumn("bookings",target))
            jdbc.update("UPDATE bookings SET "+target+"=CAST(REPLACE(REPLACE("+source+",'T',' '),'Z','') AS DATETIME(6)) WHERE "+target+" IS NULL AND "+source+" IS NOT NULL AND TRIM("+source+")<>''");
    }
    private void copy(String table,String target,String source) {
        if(hasColumn(table,target)&&hasColumn(table,source)) jdbc.update("UPDATE "+table+" SET "+target+"="+source+" WHERE "+target+" IS NULL AND "+source+" IS NOT NULL");
    }
    private boolean hasTable(String table) { return jdbc.queryForObject("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=?",Integer.class,table)>0; }
    private boolean hasColumn(String table,String column) { return jdbc.queryForObject("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?",Integer.class,table,column)>0; }
}
