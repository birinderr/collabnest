package com.collabnest.backend.service.impl;

import com.collabnest.backend.dto.ParsedCampaignDto;
import com.collabnest.backend.service.AiBriefParserService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Primary;

import java.util.List;

@Service
@Primary
@RequiredArgsConstructor
public class HybridBriefParserServiceImpl implements AiBriefParserService {

    private final AiBriefParserServiceImpl ruleParser;
    private final GeminiBriefParserServiceImpl aiParser;

    @Override
    public List<ParsedCampaignDto> parseBrief(String text) {

        if (isStructured(text)) {
            System.out.println("Using RULE parser");

            List<ParsedCampaignDto> result = ruleParser.parseBrief(text);

            if (isValid(result)) {
                return result;
            }

            System.out.println("Rule parsing weak → falling back to AI");
        }

        System.out.println("Using AI parser");
        return aiParser.parseBrief(text);
    }

    private boolean isStructured(String text) {

        String[] lines = text.split("\\n");

        int structuredLines = 0;
        int totalLines = 0;

        for (String line : lines) {
            if (line == null || line.trim().isEmpty()) continue;

            totalLines++;

            String lower = line.toLowerCase();

            boolean hasAmount = lower.matches(".*\\d+.*");
            boolean hasContent = lower.contains("reel") || lower.contains("story") || lower.contains("post") || lower.contains("short");

            boolean hasDate = lower.matches(".*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).*");
            boolean hasRelativeDate = lower.contains("next") || lower.contains("tomorrow") || lower.contains("weekend");

            boolean isLineStructured = hasAmount && hasContent && (hasDate || hasRelativeDate);

            if (isLineStructured) {
                structuredLines++;
            }
        }

        return totalLines > 0 && structuredLines >= (totalLines / 2);
    }

    private boolean isValid(List<ParsedCampaignDto> campaigns) {

        if (campaigns == null || campaigns.isEmpty()) {
            return false;
        }

        for (ParsedCampaignDto c : campaigns) {

            // basic checks
            if (c.getBrandName() == null || c.getBrandName().isEmpty()) return false;
            if (c.getContentType() == null) return false;
            if (c.getAmount() == null || c.getAmount() == 0) return false;

            // 🚨 NEW: detect bad brand extraction
            String brand = c.getBrandName().toLowerCase();

            if (brand.contains("reel")
                    || brand.contains("story")
                    || brand.matches(".*\\d+.*")) {
                return false;
            }
        }

        return true;
    }
}