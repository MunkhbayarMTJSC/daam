export function showGameEndPopup(scene, data) {
  const { width, height } = scene.scale;
  const { winner, formatetDuration, moveCount, playerColors } = data;

  const container = scene.add.container(width / 2, height / 2);

  const bg = scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.7);
  bg.setStrokeStyle(2, 0xffffff);
  container.add(bg);

  const winnerText = scene.add
    .text(0, -100, `Winner: ${winner}`, {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'MongolFont',
    })
    .setOrigin(0.5);
  container.add(winnerText);

  const statsText = scene.add
    .text(0, -50, `Duration: ${formatetDuration}\nMoves: ${moveCount}`, {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'MongolFont',
    })
    .setOrigin(0.5);
  container.add(statsText);

  const replayBtn = scene.add
    .text(0, 40, '🔁 Play Again', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#222',
      padding: { left: 12, right: 12, top: 6, bottom: 6 },
      fontFamily: 'MongolFont',
    })
    .setOrigin(0.5)
    .setInteractive();

  const backBtn = scene.add
    .text(0, 90, '🏠 Main Lobby', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#444',
      padding: { left: 12, right: 12, top: 6, bottom: 6 },
      fontFamily: 'MongolFont',
    })
    .setOrigin(0.5)
    .setInteractive();
  container.setDepth(100);

  container.add([replayBtn, backBtn]);

  replayBtn.on('pointerdown', () => {
    console.log('object :>> ', data.roomCode);
    scene.socket.emit('requestReplay', data.roomCode);
    container.destroy(); // popup-ыг устгана
    // Та GameScene дахин эхлүүлэх эсвэл бусад эвэнтийг socket-р хүлээж болно
  });

  backBtn.on('pointerdown', () => {
    scene.socket.emit('leaveRoom', data.roomCode);
    scene.scene.start('MainLobby', { socket: scene.socket });
  });
}

export function updateCapturedDisplay(scene, myCaptured, opponentCaptured) {
  const { width, height } = scene.scale;

  // 🧠 Эхний удаад хадгалах обьектоо үүсгэ
  if (!scene.capturedText) {
    scene.capturedText = {
      my: scene.add
        .text(width * 0.45, height * 0.86, `🔴 ${myCaptured}`, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'MongolFont',
        })
        .setOrigin(0, 0.5),

      opponent: scene.add
        .text(width * 0.45, height * 0.2, `⚫ ${opponentCaptured}`, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'MongolFont',
        })
        .setOrigin(0, 0.5),
    };
  } else {
    // ✅ Хэрэв аль хэдийн text байгаа бол зөвхөн текстийг шинэчилье
    scene.capturedText.my.setText(`🔴 ${myCaptured}`);
    scene.capturedText.opponent.setText(`⚫ ${opponentCaptured}`);
  }
}

export function showReconnectPopup(scene, socket, roomCode, data) {
  const width = scene.scale.width;
  const height = scene.scale.height;

  // Popup background
  const bg = scene.add
    .rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.8)
    .setOrigin(0.5);

  // Text
  const text = scene.add
    .text(
      width / 2,
      height / 2 - 50,
      `Та өрөө ${roomCode} -д өмнө нь тоглож байсан байна.\nДахин холбогдох уу?`,
      {
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
      }
    )
    .setOrigin(0.5);

  // Yes button
  const yesBtn = scene.add
    .text(width / 2 - 80, height / 2 + 40, 'Тийм', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#222222',
      padding: { x: 10, y: 5 },
    })
    .setOrigin(0.5)
    .setInteractive();

  // No button
  const noBtn = scene.add
    .text(width / 2 + 80, height / 2 + 40, 'Үгүй', {
      fontSize: '20px',
      color: '#ff0000',
      backgroundColor: '#222222',
      padding: { x: 10, y: 5 },
    })
    .setOrigin(0.5)
    .setInteractive();
  // Click listeners
  yesBtn.on('pointerdown', () => {
    socket.emit('joinRoom', {
      roomCode,
      userId: data.playerObj.userId,
      username: data.playerObj.username,
      avatarUrl: data.avatarUrl,
      reconnecting: true,
    });
    popup.destroy();
  });

  noBtn.on('pointerdown', () => {
    delete socket.player.reconnectRoomCode;
    popup.destroy();
  });

  // Container
  const popup = scene.add.container(0, 0, [bg, text, yesBtn, noBtn]);

  // Optional: popup дээр dark background нэмэх
  popup.setDepth(1000); // Бусад бүх UI дээр гарна
}

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
    'profileFrames',
    3
  );
  profileFrame.setDisplaySize(70, 80);
  scene.profileElements.push(profileFrame);

  const levelText = scene.add.text(
    position.x - 15,
    position.y - 31,
    `LvL ${level}`,
    {
      fontSize: '8px',
      color: '#fff',
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
    'profileFrames',
    3
  );
  profileFrame.setDisplaySize(size + 5, size + 5);
  scene.profileElements.push(profileFrame);
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
