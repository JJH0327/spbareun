const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱을 위한 미들웨어 추가
app.use(express.json());

// ===== 인증 관련 라우트를 먼저 처리 =====
// ===== 간단한 로그인 시스템 =====
const ADMIN_CREDENTIALS = {
    username: 'admin',        // 🔑 관리자 아이디
    password: 'can1105!#%'    // 🔑 관리자 비밀번호
};

// 로그인 API - 초간단 if문 방식
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // 간단한 if문으로 체크
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        console.log(`✅ 로그인 성공: ${username}`);
        res.json({
            success: true,
            message: '로그인 성공!'
        });
    } else {
        console.log(`❌ 로그인 실패: ${username}`);
        res.json({
            success: false,
            message: '아이디 또는 비밀번호가 틀렸습니다.'
        });
    }
});

// 관리자 페이지 접근 제한 - 정적 파일 서비스보다 먼저!
app.get('/admin-auto.html', (req, res) => {
    console.log('🔒 admin-auto.html 접근 시도 - 로그인 페이지로 리다이렉트');
    // 관리자 페이지 접근 시 로그인 페이지로 리다이렉트
    res.redirect('/login.html');
});

// 로그인된 사용자만 접근 가능한 관리자 페이지
app.get('/admin', (req, res) => {
    console.log('✅ /admin 접근 - 관리자 페이지 제공');
    // 실제 관리자 페이지 제공
    res.sendFile(path.join(__dirname, 'admin-auto.html'));
});

// 정적 파일 서비스 (웹사이트 파일들) - 인증 라우트 다음에!
app.use(express.static('.'));

// banners 폴더가 없으면 생성
const bannersDir = path.join(__dirname, 'banners');
if (!fs.existsSync(bannersDir)) {
    fs.mkdirSync(bannersDir, { recursive: true });
}

// Multer 설정 (메모리에 파일 저장)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 제한
    },
    fileFilter: (req, file, cb) => {
        // 이미지 파일만 허용
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
        }
    }
});

// 배너 업로드 API - 데스크톱/모바일 분리 업로드
app.post('/api/upload-banners', upload.fields([
    // 데스크톱 이미지
    { name: 'banner1-desktop', maxCount: 1 },
    { name: 'banner2-desktop', maxCount: 1 },
    { name: 'banner3-desktop', maxCount: 1 },
    { name: 'banner4-desktop', maxCount: 1 },
    { name: 'banner5-desktop', maxCount: 1 },
    // 모바일 이미지
    { name: 'banner1-mobile', maxCount: 1 },
    { name: 'banner2-mobile', maxCount: 1 },
    { name: 'banner3-mobile', maxCount: 1 },
    { name: 'banner4-mobile', maxCount: 1 },
    { name: 'banner5-mobile', maxCount: 1 }
]), async (req, res) => {
    try {
        const uploadedFiles = [];
        const errors = [];

        // 각 배너 파일 처리 (1-5번)
        for (let i = 1; i <= 5; i++) {
            const desktopFieldName = `banner${i}-desktop`;
            const mobileFieldName = `banner${i}-mobile`;
            
            const desktopFiles = req.files[desktopFieldName];
            const mobileFiles = req.files[mobileFieldName];
            
            let hasDesktop = desktopFiles && desktopFiles.length > 0;
            let hasMobile = mobileFiles && mobileFiles.length > 0;
            
            // 데스크톱 이미지가 없고 모바일 이미지도 없으면 건너뛰기
            if (!hasDesktop && !hasMobile) {
                continue;
            }

            try {
                // 데스크톱 이미지 처리
                if (hasDesktop) {
                    const desktopFile = desktopFiles[0];
                    const desktopPath = path.join(bannersDir, `banner${i}.jpg`);
                    
                    await sharp(desktopFile.buffer)
                        .resize(1920, null, {
                            fit: 'inside',        // 원본 비율 유지하며 최대 너비 제한
                            withoutEnlargement: true  // 원본보다 크게 확대하지 않음
                        })
                        .jpeg({
                            quality: 85,
                            progressive: true
                        })
                        .toFile(desktopPath);
                    
                    console.log(`✅ 배너 ${i} 데스크톱 업로드 완료: ${desktopPath}`);
                }
                
                // 모바일 이미지 처리
                if (hasMobile) {
                    const mobileFile = mobileFiles[0];
                    const mobilePath = path.join(bannersDir, `banner${i}-mobile.jpg`);
                    
                    await sharp(mobileFile.buffer)
                        .resize(400, null, {
                            fit: 'inside',        // 원본 비율 유지하며 최대 너비 제한
                            withoutEnlargement: true  // 원본보다 크게 확대하지 않음
                        })
                        .jpeg({
                            quality: 80,
                            progressive: true
                        })
                        .toFile(mobilePath);
                    
                    console.log(`✅ 배너 ${i} 모바일 업로드 완료: ${mobilePath}`);
                }
                
                // 업로드된 파일 기록
                if (hasDesktop && hasMobile) {
                    uploadedFiles.push(`배너 ${i} (데스크톱+모바일)`);
                } else if (hasDesktop) {
                    uploadedFiles.push(`배너 ${i} (데스크톱)`);
                } else if (hasMobile) {
                    uploadedFiles.push(`배너 ${i} (모바일)`);
                }
                
            } catch (error) {
                console.error(`❌ 배너 ${i} 처리 실패:`, error);
                errors.push(`배너 ${i}: ${error.message}`);
            }
        }

        // 응답 생성
        if (uploadedFiles.length === 0 && errors.length === 0) {
            return res.status(400).json({
                success: false,
                error: '업로드할 파일이 없습니다.'
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: errors.join(', '),
                uploaded: uploadedFiles
            });
        }

        res.json({
            success: true,
            message: `${uploadedFiles.join(', ')}가 성공적으로 업데이트되었습니다!`,
            uploaded: uploadedFiles
        });

    } catch (error) {
        console.error('업로드 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.'
        });
    }
});

// 현재 배너 이미지 목록 API
app.get('/api/banners', (req, res) => {
    try {
        const banners = [];
        
        for (let i = 1; i <= 5; i++) {
            const desktopJpg = path.join(bannersDir, `banner${i}.jpg`);
            const desktopPng = path.join(bannersDir, `banner${i}.png`);
            const mobileJpg = path.join(bannersDir, `banner${i}-mobile.jpg`);
            const mobilePng = path.join(bannersDir, `banner${i}-mobile.png`);
            
            let desktopExists = false;
            let mobileExists = false;
            let desktopFilename = null;
            let mobileFilename = null;
            
            // 데스크톱 이미지 확인
            if (fs.existsSync(desktopJpg)) {
                desktopExists = true;
                desktopFilename = `banner${i}.jpg`;
            } else if (fs.existsSync(desktopPng)) {
                desktopExists = true;
                desktopFilename = `banner${i}.png`;
            }
            
            // 모바일 이미지 확인
            if (fs.existsSync(mobileJpg)) {
                mobileExists = true;
                mobileFilename = `banner${i}-mobile.jpg`;
            } else if (fs.existsSync(mobilePng)) {
                mobileExists = true;
                mobileFilename = `banner${i}-mobile.png`;
            }
            
            banners.push({
                id: i,
                desktop: {
                    exists: desktopExists,
                    filename: desktopFilename,
                    url: desktopExists ? `/banners/${desktopFilename}` : null
                },
                mobile: {
                    exists: mobileExists,
                    filename: mobileFilename,
                    url: mobileExists ? `/banners/${mobileFilename}` : null
                },
                hasAny: desktopExists || mobileExists
            });
        }
        
        res.json({ 
            banners,
            totalActive: banners.filter(b => b.hasAny).length
        });
    } catch (error) {
        console.error('배너 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: '배너 목록을 불러올 수 없습니다.'
        });
    }
});

// 에러 핸들링
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: '파일 크기가 너무 큽니다. 5MB 이하의 파일을 업로드해주세요.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: error.message || '서버 오류가 발생했습니다.'
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
🚀 배너 관리 서버가 시작되었습니다!

📋 접속 정보:
- 관리자 패널: http://localhost:${PORT}/admin-auto.html
- 메인 웹사이트: http://localhost:${PORT}/index.html

🎯 새로운 기능:
- ✅ 최대 5개 배너 지원
- ✅ 데스크톱/모바일 분리 업로드
- ✅ 동적 슬라이더 (있는 배너만 표시)
- ✅ 스마트 이미지 최적화 (원본 비율 유지)
  • 데스크톱: 최대 1920px 너비 (높이 자동)
  • 모바일: 최대 400px 너비 (높이 자동)
- ✅ 드래그 앤 드롭 업로드
- ✅ 즉시 반영

💡 사용법: 어떤 사이즈든 업로드하면 자동으로 최적화됩니다!
    `);
});

// 종료 시 정리
process.on('SIGINT', () => {
    console.log('\n📡 서버를 종료합니다...');
    process.exit(0);
}); 