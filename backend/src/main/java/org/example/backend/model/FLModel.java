package org.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "fl_models")
public class FLModel {

    @Id
    private UUID modelid;

    private Integer round;

    private Float accuracy;

    private Instant timestamp;

    private String modelName;

    private String status;

    private Integer participatingNodes;

    private Float loss;

    public FLModel() {
        this.modelid = UUID.randomUUID();
        this.timestamp = Instant.now();
    }

    public FLModel(UUID modelid, Integer round, Float accuracy, Instant timestamp) {
        this.modelid = modelid != null ? modelid : UUID.randomUUID();
        this.round = round;
        this.accuracy = accuracy;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
    }

    public FLModel(UUID modelid, Integer round, Float accuracy, Instant timestamp,
                   String modelName, String status, Integer participatingNodes, Float loss) {
        this.modelid = modelid != null ? modelid : UUID.randomUUID();
        this.round = round;
        this.accuracy = accuracy;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
        this.modelName = modelName;
        this.status = status;
        this.participatingNodes = participatingNodes;
        this.loss = loss;
    }

    public UUID getModelid() {
        return modelid;
    }

    public void setModelid(UUID modelid) {
        this.modelid = modelid;
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

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
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
}
