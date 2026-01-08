# Bluesky Campaign Tools

Bluesky上でキャンペーンやプレゼント企画を実施するためのSPAツールです。
特定の投稿をリポスト・引用したユーザーを抽出し、フォロワー限定フィルタや抽選機能を備えています。

## 機能

*   **OAuthログイン**: Blueskyアカウントで安全にログイン。
*   **リポスト抽出**: 指定した投稿のURLから、リポストおよび引用リポストしたユーザーを全件取得。
*   **フォロワー限定**: キャンペーン主催者（ログインユーザー）をフォローしているユーザーのみをフィルタリング。
*   **日時フィルタ**: 指定した日時までにアクションを行ったユーザーを対象にします（※引用リポストは正確に判定、通常リポストはAPI仕様により判定が難しい場合があります）。
*   **抽選機能**: 対象者リストから指定人数をランダムにピックアップ。

## 技術スタック

*   React 19
*   TypeScript
*   Vite
*   Tailwind CSS v4
*   @atproto/api & oauth-client-browser

## ローカルでの実行方法

1.  リポジトリをクローンします。
2.  依存パッケージをインストールします。

    ```bash
    pnpm install
    ```

3.  開発サーバーを起動します。

    ```bash
    pnpm dev
    ```

4.  ブラウザで `http://127.0.0.1:5173` にアクセスします。
    *   **注意**: Bluesky OAuthの仕様上、`localhost` ではなく `127.0.0.1` を使用してください。

## デプロイ設定

このアプリケーションは静的サイトとして、Vercel, Netlify, Cloudflare Pagesなどにデプロイ可能です。
ただし、BlueskyのOAuth認証を正しく動作させるために、`public/client-metadata.json` の設定を本番環境のドメインに合わせて変更する必要があります。

### 手順

1.  `public/client-metadata.json` を編集します。

    ```json
    {
      "client_id": "https://<YOUR-DOMAIN>/client-metadata.json",
      "client_name": "Bluesky Campaign Tools",
      "client_uri": "https://<YOUR-DOMAIN>",
      "redirect_uris": ["https://<YOUR-DOMAIN>/"],
      "scope": "atproto transition:generic",
      "grant_types": ["authorization_code", "refresh_token"],
      "response_types": ["code"],
      "token_endpoint_auth_method": "none",
      "application_type": "web",
      "dpop_bound_access_tokens": true
    }
    ```

    *   `<YOUR-DOMAIN>` を実際のデプロイ先ドメイン（例: `my-campaign-tool.vercel.app`）に置き換えてください。
    *   `client_id` は必ず `client-metadata.json` への完全なURLである必要があります。

2.  `src/lib/auth.ts` は `window.location.origin` を使用して動的にオリジンを取得するため、通常はコードの変更は不要ですが、環境によっては調整してください。

3.  ビルドコマンドを実行し、生成された `dist` ディレクトリをデプロイします。

    ```bash
    pnpm build
    ```

## 注意事項

*   API制限（Rate Limit）により、大規模なアカウントや投稿のデータ取得には時間がかかる、または制限にかかる場合があります。
*   通常のリポスト（Quoteではないもの）の正確なタイムスタンプ取得は、現在のAT ProtocolのフィードAPI（`getRepostedBy`）では困難なため、日時フィルタは主に引用リポストに対して有効です。

## ライセンス

MIT