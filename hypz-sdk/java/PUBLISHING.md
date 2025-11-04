# Publishing hypz-sdk (Java)

We use Gradle with `maven-publish` to deploy to Maven Central via Sonatype (OSSRH).

Prerequisites:
- Sonatype (OSSRH) account and project
- GPG key for signing, exported to keyring
- `gradle` or the Gradle wrapper checked in

Gradle properties (either in `~/.gradle/gradle.properties` or project `gradle.properties`):

```
ossrhUsername=YOUR_USERNAME
ossrhPassword=YOUR_PASSWORD
signing.keyId=YOUR_KEY_ID
signing.password=YOUR_GPG_PASSPHRASE
signing.secretKeyRingFile=/path/to/secring.gpg
```

Then:

```bash
./gradlew clean publishToMavenLocal
# Verify artifacts
./gradlew publish
```

After closing and releasing the staging repository in Sonatype, the artifact will appear on Maven Central.
