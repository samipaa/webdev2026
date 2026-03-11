# 1️⃣ CREATE – Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as Browser
    participant F as Frontend
    participant B as Express Route (resources)
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>F: Client-side validation

    alt Client-side validation fail
        F-->>U: Show error
    else Client-side validation OK
        F-->>B: POST /api/resources (JSON)
        B-->>B: Validate request w/ express-validator
        F-->>U: Show message

        alt Validation fail
            B-->>F: 400 + message
        else Validation OK
            B<<-->>DB: INSERT INTO resources

            alt Duplicate
                B-->>F: 409 + message
                B<<-->>DB: INSERT INTO booking_log
            else Other error
                B-->>F: 500 + message
            else Success
                B<<-->>DB: INSERT INTO booking_log
                B-->>F: 201 + message
                F-->>U: Call loadResources()
            end
        end
    end
```

# 2️⃣ READ ALL — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as Browser
    participant F as Frontend
    participant B as Express Route (resources)
    participant DB as PostgreSQL

    U->>F: Load page (call loadResources())
    F->>B: GET /api/resources (JSON)

    B<<->>DB: SELECT * FROM resources ORDER BY created_at DESC

    alt Error
        B-->>F: 500 + message
        F-->>U: Render empty list & print error
    else Result (note: ETAG seems to be automatically used by Express, status code may be 304 Not Modified)
        F-->>U: Render resource list
        B-->>F: 304 or (200 + resource list)
    end
```

# 3️⃣ UPDATE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as Browser
    participant F as Frontend
    participant B as Express Route (resources)
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>F: Client-side validation

    alt Client-side validation fail
        F-->>U: Show error
    else Client-side validation OK
        F-->>B: PUT /api/resources/(ID) (JSON)
        B-->>B: Validate request w/ express-validator
        F-->>U: Show message
        alt Validation fail
            B-->>F: 400 + message
        else Validation OK
            B<<-->>DB: UPDATE resources

            alt Error
                B-->>F: 409 / 404 / 500 + message
            else Success
                B<<-->>DB: INSERT INTO booking_log
                B-->>F: 200 (+ data but unused)
                F-->>U: Call loadResources()
            end
        end
    end
```

# 4️⃣ DELETE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as Browser
    participant F as Frontend
    participant B as Express Route (resources)
    participant DB as PostgreSQL

    U->>F: Click delete
    F->>F: Client-side validation

    alt Client-side validation fail
        F-->>U: Show error
    else Client-side validation OK
        F-->>U: Show message
        F-->>B: DELETE /api/resources/(ID)
        B-->>B: Validate id

        alt Validation fail
            B-->>F: 400 + message
        else Validation OK
            B<<-->>DB: DELETE FROM resources WHERE id = $1

            alt Error
                B-->>F: 404 or 500 + message
            else Success
                B<<-->>DB: INSERT INTO booking_log
                B-->>F: 204
                F-->>U: Call loadResources()
            end
        end
    end
```