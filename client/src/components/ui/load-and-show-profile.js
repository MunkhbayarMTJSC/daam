export function loadAndShowProfile(scene, avatarUrl, level, position) {
  if (!scene.profileElements) scene.profileElements = [];

  const savedPosition = { ...position };
  const savedLevel = level;

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
  const container = scene.add.container(position.x, position.y);
  const profileImage = scene.add
    .image(0, -5, profileKey)
    .setDisplaySize(40, 40);

  const maskShape = scene.add.graphics();
  maskShape.fillStyle(0xffffff);
  maskShape.setPosition(position.x, position.y - 5);
  maskShape.fillCircle(0, 0, 17);
  const mask = maskShape.createGeometryMask();
  profileImage.setMask(mask);
  maskShape.visible = false;

  const frame = scene.add.sprite(0, 0, 'profileFrames', 0);

  // 4. ✨ Level text
  const levelText = scene.add.text(-11, 21, `LvL ${level}`, {
    fontSize: '8px',
    color: '#fff',
  });
  container.add([profileImage, frame, levelText]);
  scene.profileElements.push(container);
}
export function circleProfileImg(scene, avatarUrl, position, size) {
  if (!scene.profileElements) scene.profileElements = [];

  const savedPosition = { ...position };

  const profileKey = generateProfileKey(avatarUrl);

  if (!scene.textures.exists(profileKey)) {
    scene.load.image(profileKey, avatarUrl);

    scene.load.once(`filecomplete-image-${profileKey}`, () => {
      showCircleProfileImg(scene, position, profileKey);
    });

    scene.load.start();
  } else {
    showCircleProfileImg(scene, savedPosition, size, profileKey);
  }
}

function showCircleProfileImg(scene, position, size, profileKey) {
  if (!position) {
    console.error("❌ 'position' is undefined in showProfileImage");
    return;
  }
  const container = scene.add.container(position.x, position.y);
  const profileImage = scene.add
    .image(0, 0, profileKey)
    .setDisplaySize(size, size);

  const maskShape = scene.add.graphics();
  maskShape.fillStyle(0xffffff);
  maskShape.setPosition(position.x, position.y);
  maskShape.fillCircle(0, 0, size / 2);
  const mask = maskShape.createGeometryMask();
  profileImage.setMask(mask);
  maskShape.visible = false;

  const border = scene.add.graphics();
  border.lineStyle(3, 0x861d8f);
  border.strokeCircle(0, 0, size / 2);
  container.add([profileImage, border]);
  scene.profileElements.push(container);
}

function generateProfileKey(url) {
  try {
    const seed = new URL(url).searchParams.get('seed');
    return `avatar_seed_${seed}`;
  } catch (e) {
    console.warn('❌ URL parsing failed:', url);
    return `avatar_fallback_${Math.random().toString(36).slice(2, 10)}`;
  }
}
