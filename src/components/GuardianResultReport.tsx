import type { CSSProperties } from "react";
import type { GuardianMbtiResult } from "../lib/guardianMbti";

export function GuardianResultReport({
  result,
  guardianName,
  onBack,
}: {
  result: GuardianMbtiResult;
  guardianName?: string;
  onBack?: () => void;
}) {
  return (
    <section className="guardian-report">
      <div
        className="guardian-report-hero"
        style={
          {
            "--report-accent": result.palette.accent,
            "--report-soft": result.palette.soft,
          } as CSSProperties
        }
      >
        <div className="guardian-report-copy">
          <p className="eyebrow">家长测评结果</p>
          <h2>
            {guardianName ? `${guardianName}的` : ""}
            家庭沟通画像
          </h2>
          <p className="guardian-report-summary">{result.headline}</p>
        </div>
        <div className="guardian-type-badge">
          <span>{result.typeCode}</span>
          <strong>{result.typeName}</strong>
          <small>{result.tagline}</small>
        </div>
      </div>

      <div className="guardian-report-grid">
        <article className="report-card screenshot-card">
          <div className="report-card-head">
            <div>
              <p className="eyebrow">结果速览</p>
              <h3>{result.typeName}</h3>
            </div>
            <div className="type-chip">{result.typeCode}</div>
          </div>
          <p className="report-lead">{result.headline}</p>
          <div className="dimension-list">
            {result.percentages.map((item) => (
              <div key={`${item.left}-${item.right}`} className="dimension-item">
                <div className="dimension-top">
                  <span>{item.left}</span>
                  <strong>{item.dominant}</strong>
                  <span>{item.right}</span>
                </div>
                <div className="dimension-track">
                  <div
                    className="dimension-fill"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
          <small className="screenshot-tip">首屏可截图保存。</small>
        </article>

        <article className="report-card">
          <p className="eyebrow">性格概览</p>
          <h3>这类家长通常如何带孩子</h3>
          <p>{result.overview}</p>
        </article>

        <article className="report-card">
          <p className="eyebrow">沟通方式</p>
          <h3>更容易被接受的互动节奏</h3>
          <p>{result.communication}</p>
        </article>

        <article className="report-card">
          <p className="eyebrow">教育优势</p>
          <h3>已经具备的支持力量</h3>
          <ul className="report-points">
            {result.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="report-card">
          <p className="eyebrow">温和提醒</p>
          <h3>带孩子时要留意的点</h3>
          <ul className="report-points">
            {result.watchouts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      {onBack ? (
        <div className="guardian-report-actions">
          <button type="button" className="ghost" onClick={onBack}>
            返回总览
          </button>
        </div>
      ) : null}
    </section>
  );
}
