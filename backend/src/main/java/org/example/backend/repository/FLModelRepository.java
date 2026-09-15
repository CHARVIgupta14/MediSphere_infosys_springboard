package org.example.backend.repository;

import org.example.backend.model.FLModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FLModelRepository extends MongoRepository<FLModel, UUID> {

    Optional<FLModel> findTopByOrderByRoundDesc();

    Optional<FLModel> findTopByOrderByTimestampDesc();
}
