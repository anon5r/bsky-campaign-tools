export type Language = 'en' | 'ja';

export const translations = {
  en: {
    appTitle: 'Campaign Tools',
    logout: 'Log Out',
    setupTitle: 'Campaign Setup',
    targetPostLabel: 'Target Post URL',
    targetPostPlaceholder: 'https://bsky.app/profile/...',
    fetchReposts: 'Fetch Reposts',
    fetching: 'Fetching...',
    interactionsProgress: 'Interactions Progress',
    includeQuotes: 'Include Quotes',
    followersData: 'Followers Data',
    loaded: (n: number) => `${n} loaded`,
    notLoaded: 'Not loaded',
    fetchFollowers: 'Fetch Followers',
    followersProgress: 'Followers Progress',
    status: 'Status:',
    interactionsLoaded: (n: number, t: number | null) => `Interactions Loaded: ${n} ${t ? `(Total ~${t})` : ''}`,
    followersLoaded: (n: number, t: number | null) => `Followers Loaded: ${n} ${t ? `(Total ~${t})` : ''}`,
    qualifiedParticipants: (n: number) => `Qualified Participants: ${n}`,
    availableToPick: (n: number) => `Available to Pick: ${n}`,
    qualifiedParticipantsHeader: (n: number) => `Qualified Participants (${n})`,
    userColumn: 'User',
    didColumn: 'DID',
    typeColumn: 'Type',
    dateColumn: 'Date',
    pickWinnersTitle: 'Pick Winners',
    lotteryNameLabel: 'Lottery Name (for CSV)',
    pickRandomly: 'Pick Randomly',
    availableToPickCount: (n: number) => `Available to pick: ${n}`,
    tentativeWinners: 'Tentative Winners',
    cancel: 'Cancel',
    confirm: 'Confirm',
    confirmed: (n: number) => `Confirmed (${n})`,
    csvExport: 'CSV',
    noWinners: 'No confirmed winners yet.',

    // Alerts and Status Messages
    invalidUrl: 'Invalid Post URL. Please use a valid Bluesky post link.',
    resolveAuthorError: 'Could not resolve author',
    resolvingPost: 'Resolving post...',
    fetchingReposters: (c: number) => `Fetching Reposters... (${c})`,
    fetchingQuotes: (c: number) => `Fetching Quotes... (${c})`,
    fetchedInteractions: (n: number) => `Fetched ${n} interactions.`,
    fetchError: 'Error fetching interactions.',
    fetchingFollowers: (c: number) => `Fetching Your Followers... (${c})`,
    fetchedFollowers: (n: number) => `Fetched ${n} followers.`,
    fetchFollowersError: 'Error fetching followers.',
    noQualified: 'No qualified participants available to pick from.',

    // CSV Headers
    csvLotteryName: 'Lottery Name',
    csvDid: 'DID',
    csvHandle: 'Handle',
    csvDisplayName: 'Display Name',
    csvType: 'Type',
    csvDate: 'Date',

    // Disclaimer
    freeToUse: 'Anyone can use this for free.',
    disclaimerTitle: 'Important Notes & Disclaimer',
    simpleApp: 'This application is a simple tool.',
    apiUsage: 'Heavy usage may consume significant Bluesky API rate limits.',
    noMultiAccount: 'Multiple entries from the same person using different accounts are not detected or filtered.',
    disclaimerList1: 'Provided for informational purposes only. No guarantee of accuracy or completeness.',
    disclaimerList2: 'Use at your own risk. We are not liable for any damages.',
    disclaimerList3: 'Subject to change or discontinuation without notice.',
    footer: {
      credit: {
        developedBy: 'Developed by'
      }
    }
  },
  ja: {
    appTitle: 'キャンペーンツール',
    logout: 'ログアウト',
    setupTitle: 'キャンペーン設定',
    targetPostLabel: '対象の投稿URL',
    targetPostPlaceholder: 'https://bsky.app/profile/...',
    fetchReposts: 'リポストを取得',
    fetching: '取得中...',
    interactionsProgress: '取得の進捗',
    includeQuotes: '引用リポストを含める',
    followersData: 'フォロワーデータ',
    loaded: (n: number) => `${n}件 読み込み済み`,
    notLoaded: '未読み込み',
    fetchFollowers: 'フォロワーを取得',
    followersProgress: 'フォロワー取得の進捗',
    status: 'ステータス:',
    interactionsLoaded: (n: number, t: number | null) => `取得した反応: ${n}件 ${t ? `(全体 ~${t}件)` : ''}`,
    followersLoaded: (n: number, t: number | null) => `取得したフォロワー: ${n}人 ${t ? `(全体 ~${t}人)` : ''}`,
    qualifiedParticipants: (n: number) => `抽選対象者: ${n}人`,
    availableToPick: (n: number) => `抽選候補: ${n}人`,
    qualifiedParticipantsHeader: (n: number) => `抽選対象者 (${n})`,
    userColumn: 'ユーザー',
    didColumn: 'DID',
    typeColumn: 'タイプ',
    dateColumn: '日時',
    pickWinnersTitle: '当選者を選ぶ',
    lotteryNameLabel: '抽選名 (CSV用)',
    pickRandomly: 'ランダムに選ぶ',
    availableToPickCount: (n: number) => `抽選候補: ${n}人`,
    tentativeWinners: '当選候補 (仮)',
    cancel: 'キャンセル',
    confirm: '確定',
    confirmed: (n: number) => `確定済み (${n}人)`,
    csvExport: 'CSV出力',
    noWinners: '確定した当選者はまだいません。',

    // Alerts and Status Messages
    invalidUrl: '無効な投稿URLです。正しいBlueskyの投稿リンクを使用してください。',
    resolveAuthorError: '投稿者を特定できませんでした',
    resolvingPost: '投稿を解析中...',
    fetchingReposters: (c: number) => `リポストを取得中... (${c}件)`,
    fetchingQuotes: (c: number) => `引用リポストを取得中... (${c}件)`,
    fetchedInteractions: (n: number) => `${n} 件の反応を取得しました。`,
    fetchError: '反応の取得中にエラーが発生しました。',
    fetchingFollowers: (c: number) => `フォロワーを取得中... (${c}人)`,
    fetchedFollowers: (n: number) => `${n} 人のフォロワーを取得しました。`,
    fetchFollowersError: 'フォロワーの取得中にエラーが発生しました。',
    noQualified: '抽選可能な参加者がいません。',

    // CSV Headers
    csvLotteryName: '抽選名',
    csvDid: 'DID',
    csvHandle: 'ハンドル',
    csvDisplayName: '表示名',
    csvType: 'タイプ',
    csvDate: '日時',

    // Disclaimer
    disclaimerTitle: '注意事項・免責事項',
    freeToUse: '誰でも自由に無料で利用いただけます。',
    simpleApp: 'このアプリケーションは簡易的な抽選ツールです。',
    apiUsage: 'アプリケーションの利用によりBlueskyのAPIを多く消費する可能性があります。',
    noMultiAccount: '同一人物による複数アカウントによる応募は考慮（検出・除外）されません。',
    disclaimerList1: '本アプリは情報提供のみを目的としており、正確性・完全性を保証しません。',
    disclaimerList2: '利用は自己責任で行ってください。本アプリの利用による損害について一切の責任を負いません。',
    disclaimerList3: '本アプリは予告なく変更・中止される場合があります。',
    footer: {
      credit: {
        developedBy: '作った人・問い合わせ先'
      }
    }

  }

};

    