export function loadAndShowProfile(scene, avatarUrl, level, position) {
  if (!scene.profileElements) scene.profileElements = [];

  const savedPosition = { ...position };
  const savedLevel = level;

  // ✔️ Текстур бүрт зориулж unique key үүсгэе
  const profileKey = `profileImage_${btoa(avatarUrl).slice(0, 10)}`; // base64-ийн эхний хэсгийг ашиглав

  if (!scene.textures.exists(profileKey)) {
    scene.load.image(profileKey, avatarUrl);

    scene.load.once("complete", () => {
      showProfileImage(scene, savedLevel, savedPosition, profileKey);
    });

    scene.load.start();
  } else {
    showProfileImage(scene, savedLevel, savedPosition, profileKey);
  }
}

function showProfileImage(scene, level, position, profileKey) {
  if (!position) {
    console.error("❌ 'position' is undefined in showProfileImage");
    return;
  }

  const profileImage = scene.add
    .image(position.x, position.y, profileKey)
    .setDisplaySize(60, 60);
  scene.profileElements.push(profileImage);

  const profileFrame = scene.add.sprite(
    position.x,
    position.y,
    "profileFrames",
    3
  );
  profileFrame.setDisplaySize(70, 80);
  scene.profileElements.push(profileFrame);

  const levelText = scene.add.text(
    position.x - 15,
    position.y - 31,
    `LvL ${level}`,
    {
      fontSize: "8px",
      color: "#fff",
    }
  );
  scene.profileElements.push(levelText);
}
