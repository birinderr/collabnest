package com.collabnest.backend.service;

import com.collabnest.backend.dto.CreateCampaignRequest;
import com.collabnest.backend.dto.UpdateCampaignRequest;
import com.collabnest.backend.dto.ParsedCampaignDto;
import com.collabnest.backend.entity.Campaign;
import com.collabnest.backend.entity.User;
import com.collabnest.backend.enums.Role;
import com.collabnest.backend.enums.Platform;
import com.collabnest.backend.enums.ContentType;
import com.collabnest.backend.exception.AppException;
import com.collabnest.backend.repository.CampaignRepository;
import com.collabnest.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    public Campaign createCampaign(CreateCampaignRequest request, String loggedInEmail) {

        User loggedInUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        User creator;

        if (loggedInUser.getRole() == Role.ADMIN && request.getCreatorId() != null) {
            creator = userRepository.findById(request.getCreatorId())
                    .orElseThrow(() -> new AppException("Creator not found", HttpStatus.NOT_FOUND));
        } else {
            creator = loggedInUser;
        }

        Campaign campaign = Campaign.builder()
                .brandName(request.getBrandName())
                .campaignName(request.getCampaignName())
                .platform(request.getPlatform())
                .customPlatform(request.getCustomPlatform())
                .contentType(request.getContentType())
                .customContentType(request.getCustomContentType())
                .deadline(request.getDeadline())
                .amount(request.getAmount())
                .priority(request.getPriority())
                .paymentStatus(request.getPaymentStatus())
                .paymentDueDate(request.getPaymentDueDate())
                .paymentReceivedDate(request.getPaymentReceivedDate())
                .campaignStatus(request.getCampaignStatus())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .notes(request.getNotes())
                .creator(creator)
                .build();

        return campaignRepository.save(campaign);
    }

    public List<Campaign> getAllCampaigns(String loggedInEmail) {

        User loggedInUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (loggedInUser.getRole() == Role.ADMIN) {
            return campaignRepository.findAll();
        }

        return campaignRepository.findByCreator(loggedInUser);
    }

    public Campaign getCampaignById(Long id, String loggedInEmail) {

        User loggedInUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Campaign campaign;

        if (loggedInUser.getRole() == Role.ADMIN) {
            campaign = campaignRepository.findById(id)
                    .orElseThrow(() -> new AppException("Campaign not found", HttpStatus.NOT_FOUND));
        } else {
            campaign = campaignRepository.findByIdAndCreator(id, loggedInUser)
                    .orElseThrow(() -> new AppException("Campaign not found or access denied", HttpStatus.NOT_FOUND));
        }

        return campaign;
    }

    public Campaign updateCampaignById(Long id, UpdateCampaignRequest request, String loggedInEmail) {

        User loggedInUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Campaign campaign;

        if (loggedInUser.getRole() == Role.ADMIN) {
            campaign = campaignRepository.findById(id)
                    .orElseThrow(() -> new AppException("Campaign not found", HttpStatus.NOT_FOUND));
        } else {
            campaign = campaignRepository.findByIdAndCreator(id, loggedInUser)
                    .orElseThrow(() -> new AppException("Campaign not found or access denied", HttpStatus.NOT_FOUND));
        }

        // Update fields if provided
        if (request.getBrandName() != null) {
            campaign.setBrandName(request.getBrandName());
        }
        if (request.getCampaignName() != null) {
            campaign.setCampaignName(request.getCampaignName());
        }
        if (request.getPlatform() != null) {
            campaign.setPlatform(request.getPlatform());
        }
        if (request.getCustomPlatform() != null) {
            campaign.setCustomPlatform(request.getCustomPlatform());
        }
        if (request.getContentType() != null) {
            campaign.setContentType(request.getContentType());
        }
        if (request.getCustomContentType() != null) {
            campaign.setCustomContentType(request.getCustomContentType());
        }
        if (request.getDeadline() != null) {
            campaign.setDeadline(request.getDeadline());
        }
        if (request.getAmount() != null) {
            campaign.setAmount(request.getAmount());
        }
        if (request.getPriority() != null) {
            campaign.setPriority(request.getPriority());
        }
        if (request.getPaymentStatus() != null) {
            campaign.setPaymentStatus(request.getPaymentStatus());
        }
        if (request.getPaymentDueDate() != null) {
            campaign.setPaymentDueDate(request.getPaymentDueDate());
        }
        if (request.getPaymentReceivedDate() != null) {
            campaign.setPaymentReceivedDate(request.getPaymentReceivedDate());
        }
        if (request.getCampaignStatus() != null) {
            campaign.setCampaignStatus(request.getCampaignStatus());
        }
        if (request.getContactName() != null) {
            campaign.setContactName(request.getContactName());
        }
        if (request.getContactEmail() != null) {
            campaign.setContactEmail(request.getContactEmail());
        }
        if (request.getNotes() != null) {
            campaign.setNotes(request.getNotes());
        }

        return campaignRepository.save(campaign);
    }

    public void deleteCampaignById(Long id, String loggedInEmail) {

        User loggedInUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Campaign campaign;

        if (loggedInUser.getRole() == Role.ADMIN) {
            campaign = campaignRepository.findById(id)
                    .orElseThrow(() -> new AppException("Campaign not found", HttpStatus.NOT_FOUND));
        } else {
            campaign = campaignRepository.findByIdAndCreator(id, loggedInUser)
                    .orElseThrow(() -> new AppException("Campaign not found or access denied", HttpStatus.NOT_FOUND));
        }

        campaignRepository.delete(campaign);
    }

    public List<Campaign> createFromParsed(List<ParsedCampaignDto> parsed, User user) {

        List<Campaign> campaigns = new ArrayList<>();

        for (ParsedCampaignDto dto : parsed) {

            Campaign campaign = Campaign.builder()
                    .brandName(dto.getBrandName())
                    .campaignName(dto.getCampaignName())
                    .platform(mapPlatform(dto.getPlatform()))
                    .contentType(mapContentType(dto.getContentType()))
                    .deadline(dto.getDeadline() != null ? LocalDate.parse(dto.getDeadline()) : null)
                    .amount(BigDecimal.valueOf(dto.getAmount()))
                    .notes(dto.getNotes())
                    .creator(user)
                    .build();

            campaigns.add(campaign);
        }

        return campaignRepository.saveAll(campaigns);
    }

    private Platform mapPlatform(String platform) {
        try {
            return Platform.valueOf(platform.toUpperCase());
        } catch (Exception e) {
            return Platform.INSTAGRAM;
        }
    }

    private ContentType mapContentType(String contentType) {
        try {
            return ContentType.valueOf(contentType.toUpperCase());
        } catch (Exception e) {
            return ContentType.POST;
        }
    }

    public List<Campaign> createBulkCampaigns(List<CreateCampaignRequest> requests, String email) {

        List<Campaign> saved = new ArrayList<>();

        for (CreateCampaignRequest request : requests) {
            saved.add(createCampaign(request, email));
        }

        return saved;
    }
}