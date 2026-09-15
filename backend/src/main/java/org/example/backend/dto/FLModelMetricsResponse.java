package org.example.backend.dto;

import java.time.Instant;
import java.util.UUID;

public class FLModelMetricsResponse {

    private UUID modelId;
    private String modelName;
    private Integer round;
    private Float accuracy;
    private String status;
    private Integer participatingNodes;
    private Float loss;
    private Instant timestamp;

    public FLModelMetricsResponse() {
        this.timestamp = Instant.now();
    }

    public FLModelMetricsResponse(UUID modelId, String modelName, Integer round, Float accuracy,
                                  String status, Integer participatingNodes, Float loss, Instant timestamp) {
        this.modelId = modelId;
        this.modelName = modelName;
        this.round = round;
        this.accuracy = accuracy;
        this.status = status;
        this.participatingNodes = participatingNodes;
        this.loss = loss;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
    }

    public UUID getModelId() {
        return modelId;
    }

    public void setModelId(UUID modelId) {
        this.modelId = modelId;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public Integer getRound() {
        return round;
    }

    public void setRound(Integer round) {
        this.round = round;
    }

    public Float getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Float accuracy) {
        this.accuracy = accuracy;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getParticipatingNodes() {
        return participatingNodes;
    }

    public void setParticipatingNodes(Integer participatingNodes) {
        this.participatingNodes = participatingNodes;
    }

    public Float getLoss() {
        return loss;
    }

    public void setLoss(Float loss) {
        this.loss = loss;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
