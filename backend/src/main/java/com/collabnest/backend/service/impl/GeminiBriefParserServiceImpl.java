package com.collabnest.backend.service.impl;

import com.collabnest.backend.dto.ParsedCampaignDto;
import com.collabnest.backend.service.AiBriefParserService;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiBriefParserServiceImpl implements AiBriefParserService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final Logger log = LoggerFactory.getLogger(GeminiBriefParserServiceImpl.class);

    @Override
    public List<ParsedCampaignDto> parseBrief(String text) {
        return parseWithGroq(text);
    }

    private List<ParsedCampaignDto> parseWithGroq(String text) {

        String url = "https://api.groq.com/openai/v1/chat/completions";

        String prompt = buildPrompt(text);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, request, Map.class);

            String outputText = extractGroqResponse(response.getBody());

            log.info("Groq raw output: {}", outputText);

            return parseJsonToCampaigns(outputText);

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private String buildPrompt(String text) {
            return """
                You are a strict JSON data extraction engine for creator brand campaigns.

                Today is April 2026.

                Return ONLY valid JSON.
                No explanation.
                No markdown.
                No extra text.

                Format strictly:

                {
                "campaigns": [
                    {
                    "brandName": string,
                    "campaignName": string,
                    "platform": string,
                    "contentType": string,
                    "deadline": string,
                    "amount": number,
                    "notes": string
                    }
                ]
                }

                CRITICAL RULES:

                PLATFORM must be ONLY one of these exact values:
                INSTAGRAM
                YOUTUBE
                LINKEDIN
                X
                OTHER

                CONTENT TYPE must be ONLY one of these exact values:
                REEL
                POST
                STORY
                SHORT
                VIDEO
                OTHER

                Never return human-friendly values like:
                Instagram, Reel, Shorts, YouTube Shorts, Twitter

                Always convert:
                IG -> INSTAGRAM
                Instagram -> INSTAGRAM
                Youtube -> YOUTUBE
                Twitter -> X
                Stories -> STORY
                Reel -> REEL
                Shorts -> SHORT
                YouTube Shorts -> SHORT
                Short-form video -> SHORT

                campaignName must NOT be generic like:
                "Nike Collaboration Campaign"

                campaignName must be meaningful and descriptive based on the brief.
                Examples:
                "Nike Summer Drop Reel"
                "Adidas Spring Launch Campaign"
                "Numa YouTube Shorts Campaign"

                If no explicit campaign name exists,
                generate the best descriptive campaign name from context.

                Convert:
                8k -> 8000

                Resolve relative dates like:
                next Friday

                relative to April 2026.

                deadline must be:
                YYYY-MM-DD

                Year must default to 2026 unless explicitly specified.

                Do not return null for campaignName.

                notes should preserve the important original brief details.

                Input:
        """ + text;
    }

    private String extractGroqResponse(Map response) {
        try {
            List choices = (List) response.get("choices");
            Map first = (Map) choices.get(0);
            Map message = (Map) first.get("message");

            return (String) message.get("content");
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    private List<ParsedCampaignDto> parseJsonToCampaigns(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> map = mapper.readValue(json, Map.class);
            List<Map<String, Object>> campaigns =
                    (List<Map<String, Object>>) map.get("campaigns");

            List<ParsedCampaignDto> result = new ArrayList<>();

            for (Map<String, Object> c : campaigns) {
                ParsedCampaignDto dto = new ParsedCampaignDto();

                dto.setBrandName((String) c.get("brandName"));
                dto.setCampaignName((String) c.get("campaignName"));
                dto.setPlatform((String) c.get("platform"));
                dto.setContentType((String) c.get("contentType"));
                dto.setDeadline((String) c.get("deadline"));

                Object amount = c.get("amount");
                dto.setAmount(amount == null ? 0.0 : Double.parseDouble(amount.toString()));

                dto.setNotes((String) c.get("notes"));

                result.add(dto);
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}