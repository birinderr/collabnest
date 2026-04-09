package com.collabnest.backend.repository;

import com.collabnest.backend.entity.Campaign;
import com.collabnest.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByCreator(User creator);

    Optional<Campaign> findByIdAndCreator(Long id, User creator);
}