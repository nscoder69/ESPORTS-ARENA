package com.esports.repository;

import com.esports.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
    Optional<SystemSetting> findBySettingKey(String settingKey);
}
