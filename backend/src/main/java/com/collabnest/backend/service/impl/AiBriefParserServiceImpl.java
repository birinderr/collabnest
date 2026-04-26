package com.collabnest.backend.service.impl;

import com.collabnest.backend.dto.ParsedCampaignDto;
import com.collabnest.backend.service.AiBriefParserService;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiBriefParserServiceImpl implements AiBriefParserService {

@Override
public List<ParsedCampaignDto> parseBrief(String text) {
    return parseWithRules(text);
}

    private List<ParsedCampaignDto> parseWithRules(String text) {
        List<ParsedCampaignDto> campaigns = new ArrayList<>();

        String[] lines = text.split("\\n");

        for (String line : lines) {
            if (line == null || line.trim().isEmpty()) {
                continue;
            }

            ParsedCampaignDto campaign = new ParsedCampaignDto();

            campaign.setBrandName(extractBrand(line));
            campaign.setCampaignName(extractCampaignName(line));
            campaign.setPlatform(extractPlatform(line));
            campaign.setContentType(extractContentType(line));
            campaign.setDeadline(extractDeadline(line));
            campaign.setAmount(extractAmount(line));
            campaign.setNotes(line.trim());

            campaigns.add(campaign);
        }

        return campaigns;
    }

    private String extractBrand(String line) {
        String[] parts = line.split("-");

        if (parts.length > 0 && !parts[0].trim().isEmpty()) {
            return parts[0].trim();
        }

        // fallback
        return "Unknown Brand";
    }

    private String extractCampaignName(String line) {
        String brand = extractBrand(line);
        return brand + " Collaboration Campaign";
    }

    private String extractPlatform(String line) {
        String lower = line.toLowerCase();

        if (lower.contains("instagram") || lower.contains("ig")) {
            return "Instagram";
        }

        if (lower.contains("youtube") || lower.contains("yt")) {
            return "YouTube";
        }

        if (lower.contains("twitter") || lower.contains(" x")) {
            return "X";
        }

        return "Instagram";
    }

    private String extractContentType(String line) {
        String lower = line.toLowerCase();

        if (lower.contains("reel")) return "Reel";
        if (lower.contains("story")) return "Story";
        if (lower.contains("short")) return "Short";

        return "Post";
    }

    private String extractDeadline(String line) {
        Pattern pattern = Pattern.compile("(?i)(apr|may|jun|jul|aug|sep|oct|nov|dec|jan|feb|mar)\\s*(\\d{1,2})");
        Matcher matcher = pattern.matcher(line);

        if (matcher.find()) {
            String month = matcher.group(1).toLowerCase();
            String day = matcher.group(2);

            String monthNumber = switch (month) {
                case "jan" -> "01";
                case "feb" -> "02";
                case "mar" -> "03";
                case "apr" -> "04";
                case "may" -> "05";
                case "jun" -> "06";
                case "jul" -> "07";
                case "aug" -> "08";
                case "sep" -> "09";
                case "oct" -> "10";
                case "nov" -> "11";
                case "dec" -> "12";
                default -> "01";
            };

            return "2026-" + monthNumber + "-" + String.format("%02d", Integer.parseInt(day));
        }

        return null;
    }

    private Double extractAmount(String line) {
        String lower = line.toLowerCase();

        // handle 8k, 15k
        Pattern kPattern = Pattern.compile("(\\d+)\\s*k");
        Matcher kMatcher = kPattern.matcher(lower);
        if (kMatcher.find()) {
            return Double.parseDouble(kMatcher.group(1)) * 1000;
        }

        // handle ₹ 8000 or 8000
        Pattern pattern = Pattern.compile("(₹\\s*)?(\\d{3,6})");
        Matcher matcher = pattern.matcher(line);

        if (matcher.find()) {
            return Double.parseDouble(matcher.group(2));
        }

        return 0.0;
    }
}