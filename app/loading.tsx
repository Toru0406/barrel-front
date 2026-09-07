/**
 * ルートローディングUI — App Router が Suspense 境界で使用する。
 * レイアウトシフトを防ぐため、実際のコンテンツと高さが近いスケルトンを用意する。
 * アニメーションは CSS pulse のみ（JS なし）。
 */
export default function Loading() {
  return (
    <div
      aria-label="読み込み中"
      aria-busy="true"
      style={{ backgroundColor: "var(--c-paper)", minHeight: "100vh" }}
    >
      {/* Section 1 skeleton */}
      <div
        className="mx-auto px-4 py-s-7"
        style={{ maxWidth: 1240 }}
      >
        <div className="grid grid-cols-12 gap-s-5 lg:gap-s-6">
          {/* Lead skeleton: 7 col */}
          <div className="col-span-12 lg:col-span-7">
            {/* 画像 */}
            <div
              className="w-full animate-pulse"
              style={{
                aspectRatio: "16/9",
                backgroundColor: "var(--c-paper-2)",
                marginBottom: "var(--s-4)",
              }}
            />
            {/* Eyebrow */}
            <div
              className="animate-pulse"
              style={{
                height: 12,
                width: 80,
                backgroundColor: "var(--c-paper-2)",
                marginBottom: "var(--s-2)",
              }}
            />
            {/* タイトル */}
            <div
              className="animate-pulse"
              style={{
                height: 36,
                width: "90%",
                backgroundColor: "var(--c-paper-2)",
                marginBottom: "var(--s-2)",
              }}
            />
            <div
              className="animate-pulse"
              style={{
                height: 36,
                width: "70%",
                backgroundColor: "var(--c-paper-2)",
                marginBottom: "var(--s-3)",
              }}
            />
            {/* リード */}
            <div
              className="animate-pulse"
              style={{
                height: 16,
                width: "100%",
                backgroundColor: "var(--c-paper-2)",
                marginBottom: "var(--s-2)",
              }}
            />
            <div
              className="animate-pulse"
              style={{
                height: 16,
                width: "80%",
                backgroundColor: "var(--c-paper-2)",
              }}
            />
          </div>

          {/* Secondary skeleton: 5 col */}
          <div
            className="hidden lg:flex lg:col-span-5 flex-col gap-s-5"
            style={{ borderLeft: "1px solid var(--c-line)", paddingLeft: "var(--s-6)" }}
          >
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-s-4">
                <div
                  className="flex-shrink-0 animate-pulse"
                  style={{
                    width: 120,
                    aspectRatio: "4/3",
                    backgroundColor: "var(--c-paper-2)",
                  }}
                />
                <div className="flex-1">
                  <div
                    className="animate-pulse"
                    style={{
                      height: 12,
                      width: 60,
                      backgroundColor: "var(--c-paper-2)",
                      marginBottom: "var(--s-2)",
                    }}
                  />
                  <div
                    className="animate-pulse"
                    style={{
                      height: 16,
                      width: "100%",
                      backgroundColor: "var(--c-paper-2)",
                      marginBottom: "var(--s-1)",
                    }}
                  />
                  <div
                    className="animate-pulse"
                    style={{
                      height: 16,
                      width: "80%",
                      backgroundColor: "var(--c-paper-2)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2 skeleton */}
      <div
        style={{ borderTop: "1px solid var(--c-line)" }}
      >
        <div className="mx-auto px-4 py-s-7" style={{ maxWidth: 1240 }}>
          <div
            className="animate-pulse"
            style={{
              height: 24,
              width: 120,
              backgroundColor: "var(--c-paper-2)",
              marginBottom: "var(--s-5)",
            }}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex gap-s-4 py-s-3 animate-pulse"
              style={{ borderBottom: "1px solid var(--c-line)" }}
            >
              <div className="flex-1">
                <div
                  style={{
                    height: 16,
                    width: "80%",
                    backgroundColor: "var(--c-paper-2)",
                  }}
                />
              </div>
              <div
                style={{
                  width: 96,
                  height: 64,
                  backgroundColor: "var(--c-paper-2)",
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
