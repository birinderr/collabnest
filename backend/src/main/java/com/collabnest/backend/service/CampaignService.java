package com.collabnest.backend.service;

import com.collabnest.backend.dto.CreateCampaignRequest;
import com.collabnest.backend.entity.Campaign;
import com.collabnest.backend.entity.User;
import com.collabnest.backend.enums.Role;
import com.collabnest.backend.exception.AppException;
import com.collabnest.backend.repository.CampaignRepository;
import com.collabnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

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
}