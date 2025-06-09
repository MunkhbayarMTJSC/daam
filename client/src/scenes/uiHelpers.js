export function loadAndShowProfile(scene, avatarUrl, level, position) {
  if (!scene.profileElements) scene.profileElements = [];

  const savedPosition = { ...position };
  const savedLevel = level;

  // ✔️ Текстур бүрт зориулж unique key үүсгэе
  const profileKey = generateProfileKey(avatarUrl);

  if (!scene.textures.exists(profileKey)) {
    scene.load.image(profileKey, avatarUrl);

    scene.load.once(`filecomplete-image-${profileKey}`, () => {
      showProfileImage(scene, level, position, profileKey);
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

export function circleProfileImg(scene, avatarUrl, size, position) {
  if (!scene.profileElements) scene.profileElements = [];

  const profileKey = generateProfileKey(avatarUrl);

  if (!scene.textures.exists(profileKey)) {
    scene.load.image(profileKey, avatarUrl);

    // 🔥 Зөвхөн энэ зураг амжилттай ачаалагдвал ажиллуул
    scene.load.once(`filecomplete-image-${profileKey}`, () => {
      showProfileImageCircle(scene, size, position, profileKey);
    });

    scene.load.start();
  } else {
    showProfileImageCircle(scene, size, position, profileKey);
  }

  console.log("Generated Key:", profileKey, "from URL:", avatarUrl);
}

function showProfileImageCircle(scene, size, position, profileKey) {
  if (!position) {
    console.error("❌ 'position' is undefined in showProfileImage");
    return;
  }

  const profileImage = scene.add
    .image(position.x, position.y, profileKey)
    .setDisplaySize(size, size);
  scene.profileElements.push(profileImage);

  const profileFrame = scene.add.sprite(
    position.x,
    position.y,
    "profileFrames",
    3
  );
  profileFrame.setDisplaySize(size + 5, size + 5);
  scene.profileElements.push(profileFrame);
}

function generateProfileKey(url) {
  try {
    const seed = new URL(url).searchParams.get("seed");
    return `avatar_seed_${seed}`;
  } catch (e) {
    console.warn("❌ URL parsing failed:", url);
    return `avatar_fallback_${Math.random().toString(36).slice(2, 10)}`;
  }
}
