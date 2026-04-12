package com.collabnest.backend.controller;

import com.collabnest.backend.dto.CreateCampaignRequest;
import com.collabnest.backend.dto.UpdateCampaignRequest;
import com.collabnest.backend.entity.Campaign;
import com.collabnest.backend.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    public Campaign createCampaign(
            @Valid @RequestBody CreateCampaignRequest request,
            Authentication authentication
    ) {
        return campaignService.createCampaign(
                request,
                authentication.getName()
        );
    }

    @GetMapping
    public List<Campaign> getAllCampaigns(Authentication authentication) {
        return campaignService.getAllCampaigns(
                authentication.getName()
        );
    }

    @GetMapping("/{id}")
    public Campaign getCampaignById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return campaignService.getCampaignById(
                id,
                authentication.getName()
        );
    }

    @PutMapping("/{id}")
    public Campaign updateCampaignById(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCampaignRequest request,
            Authentication authentication
    ) {
        return campaignService.updateCampaignById(
                id,
                request,
                authentication.getName()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCampaignById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        campaignService.deleteCampaignById(
                id,
                authentication.getName()
        );
    }
}