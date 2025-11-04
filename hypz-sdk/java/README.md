# Hypz SDK for Java

Beginner-friendly Java client for Hypz Cloud Storage (OkHttp + Gson under the hood).

- Build tool: Gradle (maven-publish configured)
- Java: 8+
- Auth: API key or JWT

## Install (from Maven Central)

Once published, add to your build.gradle:

```gradle
implementation 'io.hypz:hypz-sdk:1.0.1'
```

## Quick start

```java
Hypz hypz = new Hypz.Builder()
    .setApiKey(System.getenv("HYPZ_API_KEY")) // or setJwt(...)
    .setBaseUrl("http://localhost:5000/api/v1")
    .build();

Map<String, Object> bucket = hypz.buckets().create("docs-demo", "private");
byte[] data = "hello hypz".getBytes(StandardCharsets.UTF_8);
Map<String, Object> file = hypz.files().upload((String)bucket.get("id"), data, "hello.txt");
String url = hypz.files().getSignedUrl((String)file.get("id"), 3600);
System.out.println("Shareable link: " + url);
```

## Buckets

- create(name, visibility)
- list(page, limit)
- get(id)
- update(id, name?, visibility?)
- delete(id)

## Files

- upload(bucketId, byte[], filename)
- upload(path, filename)
- list(bucketId, page, limit)
- get(fileId)
- update(fileId, isPublic?, tags?)
- delete(fileId)
- download(fileId) → byte[]
- downloadTo(fileId, Path dest)
- getSignedUrl(fileId, expiresInSeconds) // max 7 days

## Errors

SDK throws HypzException for API errors, exposing statusCode, message, and response body.

## Publishing (maintainers)

- Configure OSSRH credentials and GPG signing
- `./gradlew publish` to deploy to Maven Central (via Sonatype)

## Links

- Docs: https://docs.hypz.io
- Issues: https://github.com/ysr-hameed/hypz/issues
- License: MIT
