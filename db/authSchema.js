const authCollections = [
  {
    name: 'users',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['fullName', 'email', 'passwordHash', 'role', 'createdAt'],
        properties: {
          fullName: { bsonType: 'string', minLength: 2, maxLength: 100 },
          email: { bsonType: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
          mobile: { bsonType: 'string', maxLength: 30 },
          passwordHash: { bsonType: 'string', pattern: '^\\$2[aby]\\$\\d{2}\\$.{53}$' },
          role: { enum: ['citizen', 'authority', 'worker', 'field_worker'] },
          demoAccount: { bsonType: 'bool' },
          department: { bsonType: 'string', maxLength: 100 },
          employeeId: { bsonType: 'string', maxLength: 80 },
          workLocation: { bsonType: 'string', maxLength: 200 },
          approvalStatus: { enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'] },
          applicationStatus: { enum: ['PENDING_APPROVAL', 'MORE_INFO_REQUIRED', 'APPROVED', 'REJECTED'] },
          approvedBy: { bsonType: 'objectId' },
          createdAt: { bsonType: 'date' },
          approvedAt: { bsonType: 'date' },
          rejectionReason: { bsonType: 'string', maxLength: 1000 },
          adminMessage: { bsonType: 'string', maxLength: 1000 },
          profileProof: {
            bsonType: 'object',
            required: ['fileName', 'contentType', 'data'],
            properties: {
              fileName: { bsonType: 'string', maxLength: 200 },
              contentType: { enum: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
              data: { bsonType: 'string', maxLength: 2800000 }
            }
          },
          authorityApprovedAt: { bsonType: 'date' },
          passwordUpdatedAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { email: 1 }, options: { name: 'email_1', unique: true } }
    ]
  },
  {
    name: 'sessions',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['tokenHash', 'userId', 'expiresAt', 'createdAt'],
        properties: {
          tokenHash: { bsonType: 'string', pattern: '^[a-f0-9]{64}$' },
          userId: { bsonType: 'objectId' },
          expiresAt: { bsonType: 'date' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { tokenHash: 1 }, options: { name: 'tokenHash_1', unique: true } },
      { key: { userId: 1 }, options: { name: 'sessions_user_id' } },
      { key: { expiresAt: 1 }, options: { name: 'expiresAt_1', expireAfterSeconds: 0 } }
    ]
  },
  {
    name: 'passwordResets',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'tokenHash', 'expiresAt', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          tokenHash: { bsonType: 'string', pattern: '^[a-f0-9]{64}$' },
          expiresAt: { bsonType: 'date' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { tokenHash: 1 }, options: { name: 'tokenHash_1', unique: true } },
      { key: { userId: 1 }, options: { name: 'password_resets_user_id' } },
      { key: { expiresAt: 1 }, options: { name: 'expiresAt_1', expireAfterSeconds: 0 } }
    ]
  },
  {
    name: 'complaints',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'userId', 'category', 'location', 'status', 'createdAt'],
        properties: {
          id: { bsonType: 'string', pattern: '^CE-\\d{4}-\\d{6}$' },
          userId: { bsonType: 'objectId' },
          category: { bsonType: 'string', minLength: 1, maxLength: 80 },
          location: { bsonType: 'string', minLength: 1, maxLength: 300 },
          description: { bsonType: 'string', maxLength: 4000 },
          status: { enum: ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Evidence Submitted', 'Rework Required', 'Resolved'] },
          department: { bsonType: 'string', maxLength: 100 },
          worker: { bsonType: 'string', maxLength: 100 },
          assignedWorkerId: { bsonType: 'objectId' },
          assignmentHistory: { bsonType: 'array' },
          workerTaskStatus: { enum: ['Assigned', 'In Progress', 'Evidence Submitted', 'Rework Required', 'Approved'] },
          demoData: { bsonType: 'bool' },
          demoSeedKey: { bsonType: 'string', maxLength: 100 },
          evidenceSubmissions: { bsonType: 'array' },
          approvedEvidence: { bsonType: 'array' },
          assignmentInstructions: { bsonType: 'string', maxLength: 1000 },
          assignmentDeadline: { bsonType: 'date' },
          resolvedAt: { bsonType: 'date' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { id: 1 }, options: { name: 'complaints_public_id_unique', unique: true } },
      { key: { demoSeedKey: 1 }, options: { name: 'complaints_demo_seed_key', unique: true, sparse: true } },
      { key: { userId: 1, createdAt: -1 }, options: { name: 'complaints_citizen_created' } },
      { key: { status: 1, priorityScore: -1 }, options: { name: 'complaints_authority_queue' } },
      { key: { category: 1, createdAt: -1 }, options: { name: 'complaints_category_created' } }
    ]
  },
  {
    name: 'notifications',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'title', 'message', 'read', 'createdAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          title: { bsonType: 'string', minLength: 1, maxLength: 120 },
          message: { bsonType: 'string', minLength: 1, maxLength: 1000 },
          read: { bsonType: 'bool' },
          complaintId: { bsonType: 'string', maxLength: 40 },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { userId: 1, createdAt: -1 }, options: { name: 'notifications_user_created' } },
      { key: { userId: 1, read: 1 }, options: { name: 'notifications_user_unread' } }
    ]
  },
  {
    name: 'counters',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['value'],
        properties: {
          value: { bsonType: 'int', minimum: 0 }
        }
      }
    },
    indexes: []
  }
];

export const ensureAuthCollections = async (db) => {
  for (const collection of authCollections) {
    const exists = await db.listCollections({ name: collection.name }, { nameOnly: true }).hasNext();
    if (!exists) {
      await db.createCollection(collection.name, {
        validator: collection.validator,
        validationLevel: 'strict',
        validationAction: 'error'
      });
    } else {
      await db.command({
        collMod: collection.name,
        validator: collection.validator,
        validationLevel: 'strict',
        validationAction: 'error'
      });
    }

    const collectionHandle = db.collection(collection.name);
    const existingIndexes = await collectionHandle.listIndexes().toArray();
    for (const index of collection.indexes) {
      const matchingIndex = existingIndexes.find((existing) => (
        JSON.stringify(existing.key) === JSON.stringify(index.key)
      ));
      if (matchingIndex) {
        const optionsMatch = (
          Boolean(matchingIndex.unique) === Boolean(index.options.unique) &&
          Boolean(matchingIndex.sparse) === Boolean(index.options.sparse) &&
          (matchingIndex.expireAfterSeconds ?? null) === (index.options.expireAfterSeconds ?? null)
        );
        if (optionsMatch) continue;
        await collectionHandle.dropIndex(matchingIndex.name);
      }
      await collectionHandle.createIndex(index.key, index.options);
    }
  }

  return Promise.all(authCollections.map(async ({ name }) => ({
    name,
    indexes: (await db.collection(name).listIndexes().toArray()).map(({ name: indexName }) => indexName)
  })));
};
