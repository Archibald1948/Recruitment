module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능
        'fix', // 버그 수정
        'docs', // 문서 수정
        'style', // 스타일 수정 (기능 변화 없음)
        'refactor', // 리팩토링
        'test', // 테스트
        'chore', // 빌드, 패키지 관리 등의 작업
        'perf', // 성능 개선
        'ci', // CI/CD 관련 설정
        'build', // 빌드 관련 작업
        'revert', // 이전 커밋 되돌리기
      ],
    ],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
  },
};
