"use client";

import {
  type KeyboardEvent,
  useId,
  useRef,
  useState,
} from "react";

import {
  capsuleCategories,
  historicalSources,
  type CapsuleCategory,
  type CapsuleFact,
  type ConfidenceLevel,
  type GroundingKind,
  type HistoricalSource,
} from "@/lib/history-1998";

const groundingLabels: Record<GroundingKind, string> = {
  documented: "Documented",
  representative: "Representative",
  fictional: "Fictional",
};

const groundingDescriptions: Record<GroundingKind, string> = {
  documented: "A documented historical claim linked to curated sources.",
  representative:
    "A representative period reconstruction synthesized from historical evidence.",
  fictional:
    "A fictionalized detail included for atmosphere, not presented as historical fact.",
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
};

const confidenceDescriptions: Record<ConfidenceLevel, string> = {
  high: "Directly supported by clear, dated historical evidence.",
  medium: "A careful synthesis whose exact framing is interpretive.",
};

type FactCardProps = {
  fact: CapsuleFact;
  categoryId: CapsuleCategory["id"];
  instanceId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenSources: (trigger: HTMLButtonElement) => void;
};

type SourceScope = {
  sourceIds: string[];
  label: string;
};

function FactCard({
  fact,
  categoryId,
  instanceId,
  isExpanded,
  onToggle,
  onOpenSources,
}: FactCardProps) {
  const detailId = `${instanceId}-${categoryId}-${fact.id}-detail`;
  const sourceCount = fact.sourceIds.length;
  const confidenceLabel =
    fact.grounding === "fictional"
      ? "Not a factual claim"
      : confidenceLabels[fact.confidence];
  const confidenceDescription =
    fact.grounding === "fictional"
      ? "This detail is intentionally invented and is not scored as historical evidence."
      : confidenceDescriptions[fact.confidence];

  return (
    <article
      className={`capsule-fact-card${isExpanded ? " is-expanded" : ""}`}
    >
      <button
        className="capsule-fact-trigger"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={onToggle}
      >
        <span className="capsule-fact-topline">
          <span className="capsule-fact-eyebrow">{fact.eyebrow}</span>
          <span className="capsule-fact-badges">
            <span
              className={`capsule-badge capsule-badge-${fact.grounding}`}
            >
              {groundingLabels[fact.grounding]}
            </span>
            <span
              className={`capsule-badge capsule-confidence-${fact.confidence}`}
            >
              {confidenceLabel}
            </span>
          </span>
        </span>
        <strong className="capsule-fact-title">{fact.title}</strong>
        <span className="capsule-fact-summary">{fact.summary}</span>
        <span className="capsule-fact-action" aria-hidden="true">
          {isExpanded ? "Hide the full story −" : "Read the full story +"}
        </span>
      </button>

      <div
        className="capsule-fact-detail"
        id={detailId}
        hidden={!isExpanded}
      >
        <p>{fact.detail}</p>
        <dl className="capsule-fact-context">
          <div>
            <dt>Grounding</dt>
            <dd>{groundingDescriptions[fact.grounding]}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{confidenceDescription}</dd>
          </div>
        </dl>
        {sourceCount > 0 && (
          <button
            className="source-inline-button"
            type="button"
            onClick={(event) => onOpenSources(event.currentTarget)}
          >
            View {sourceCount} {sourceCount === 1 ? "source" : "sources"}
          </button>
        )}
      </div>
    </article>
  );
}

function SourceCard({ source }: { source: HistoricalSource }) {
  return (
    <article className="source-card">
      <div className="source-card-meta">
        <span>{source.organization}</span>
        <time>{source.dateLabel}</time>
      </div>
      <h4>{source.title}</h4>
      <p>{source.summary}</p>
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        Open source
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only">: {source.title} (opens in a new tab)</span>
      </a>
    </article>
  );
}

export function TimeCapsule() {
  const generatedId = useId();
  const instanceId = `capsule-${generatedId.replaceAll(":", "")}`;
  const [activeCategoryId, setActiveCategoryId] = useState<
    CapsuleCategory["id"]
  >(capsuleCategories[0]?.id ?? "snapshot");
  const [expandedFactId, setExpandedFactId] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sourceScope, setSourceScope] = useState<SourceScope | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sourcesButtonRef = useRef<HTMLButtonElement | null>(null);
  const sourceCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const sourceReturnFocusRef = useRef<HTMLButtonElement | null>(null);

  const activeCategory =
    capsuleCategories.find((category) => category.id === activeCategoryId) ??
    capsuleCategories[0];
  const categorySourceIds = new Set(
    activeCategory.facts.flatMap((fact) => fact.sourceIds),
  );
  const categorySources: HistoricalSource[] = historicalSources.filter(
    (source) => categorySourceIds.has(source.id),
  );
  const visibleSourceIds = sourceScope
    ? new Set(sourceScope.sourceIds)
    : categorySourceIds;
  const visibleSources: HistoricalSource[] = historicalSources.filter((source) =>
    visibleSourceIds.has(source.id),
  );
  const sourceDrawerId = `${instanceId}-sources`;
  const sourceDrawerTitleId = `${sourceDrawerId}-title`;

  function selectCategory(categoryId: CapsuleCategory["id"]) {
    setActiveCategoryId(categoryId);
    setExpandedFactId(null);
    setSourceScope(null);
  }

  function focusCategory(index: number) {
    const categoryCount = capsuleCategories.length;
    const wrappedIndex = (index + categoryCount) % categoryCount;
    const nextCategory = capsuleCategories[wrappedIndex];

    if (!nextCategory) return;

    selectCategory(nextCategory.id);
    tabRefs.current[wrappedIndex]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    categoryIndex: number,
  ) {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusCategory(categoryIndex - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusCategory(categoryIndex + 1);
        break;
      case "Home":
        event.preventDefault();
        focusCategory(0);
        break;
      case "End":
        event.preventDefault();
        focusCategory(capsuleCategories.length - 1);
        break;
    }
  }

  function openSources(
    scope?: SourceScope,
    returnFocusTarget?: HTMLButtonElement,
  ) {
    setSourceScope(scope ?? null);
    sourceReturnFocusRef.current =
      returnFocusTarget ?? sourcesButtonRef.current;
    setSourcesOpen(true);
    window.requestAnimationFrame(() => sourceCloseButtonRef.current?.focus());
  }

  function closeSources() {
    const returnFocusTarget = sourceReturnFocusRef.current;
    setSourcesOpen(false);
    window.requestAnimationFrame(() => {
      if (
        returnFocusTarget?.isConnected &&
        !returnFocusTarget.closest("[hidden]")
      ) {
        returnFocusTarget.focus();
        return;
      }

      sourcesButtonRef.current?.focus();
    });
  }

  function handleSourceDrawerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeSources();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="capsule-layout capsule-explorer">
      <nav
        className="capsule-nav"
        aria-label="Time capsule explorer"
        inert={sourcesOpen}
      >
        <p className="capsule-nav-label">Explore December 1998</p>
        <div
          className="capsule-tabs"
          role="tablist"
          aria-label="Time capsule categories"
        >
          {capsuleCategories.map((category, index) => {
            const isActive = category.id === activeCategoryId;
            const tabId = `${instanceId}-tab-${category.id}`;
            const panelId = `${instanceId}-panel-${category.id}`;

            return (
              <button
                className={`capsule-tab${isActive ? " active" : ""}`}
                id={tabId}
                key={category.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectCategory(category.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="capsule-main">
        {capsuleCategories.map((category) => {
          const isActive = category.id === activeCategoryId;
          const tabId = `${instanceId}-tab-${category.id}`;
          const panelId = `${instanceId}-panel-${category.id}`;

          return (
            <section
              className="capsule-content"
              id={panelId}
              key={category.id}
              role="tabpanel"
              aria-labelledby={tabId}
              tabIndex={0}
              inert={sourcesOpen}
              hidden={!isActive}
            >
              <header className="capsule-header">
                <div className="capsule-heading">
                  <p className="win-kicker">{category.kicker}</p>
                  <h2>{category.title}</h2>
                  <p className="capsule-intro">{category.intro}</p>
                </div>
                <button
                  className="source-toggle"
                  type="button"
                  ref={isActive ? sourcesButtonRef : undefined}
                  aria-expanded={sourcesOpen}
                  aria-controls={sourceDrawerId}
                  onClick={(event) => {
                    if (sourcesOpen) {
                      closeSources();
                    } else {
                      openSources(undefined, event.currentTarget);
                    }
                  }}
                >
                  Sources <span aria-hidden="true">·</span> {categorySources.length}
                </button>
              </header>

              <div className="fact-grid capsule-fact-grid">
                {category.facts.map((fact) => (
                  <FactCard
                    categoryId={category.id}
                    fact={fact}
                    instanceId={instanceId}
                    isExpanded={
                      isActive && expandedFactId === `${category.id}:${fact.id}`
                    }
                    key={fact.id}
                    onToggle={() => {
                      const factKey = `${category.id}:${fact.id}`;
                      setExpandedFactId((current) =>
                        current === factKey ? null : factKey,
                      );
                    }}
                    onOpenSources={(trigger) =>
                      openSources(
                        { sourceIds: fact.sourceIds, label: fact.title },
                        trigger,
                      )
                    }
                  />
                ))}
              </div>

              <div className="capsule-legend" aria-label="Evidence labels">
                <strong>How to read this capsule</strong>
                <span>
                  <span className="capsule-badge capsule-badge-documented">
                    Documented
                  </span>{" "}
                  is source-backed history.
                </span>
                <span>
                  <span className="capsule-badge capsule-badge-representative">
                    Representative
                  </span>{" "}
                  is a period-grounded reconstruction.
                </span>
                <span>
                  <span className="capsule-badge capsule-badge-fictional">
                    Fictional
                  </span>{" "}
                  is clearly invented atmosphere.
                </span>
              </div>
            </section>
          );
        })}

        <aside
          className="source-drawer"
          id={sourceDrawerId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={sourceDrawerTitleId}
          hidden={!sourcesOpen}
          onKeyDown={handleSourceDrawerKeyDown}
        >
          <header className="source-drawer-header">
            <div>
              <p className="source-drawer-kicker">Curated evidence</p>
              <h3 id={sourceDrawerTitleId}>
                Sources for {sourceScope?.label ?? activeCategory.label}
              </h3>
            </div>
            <button
              className="source-drawer-close"
              type="button"
              ref={sourceCloseButtonRef}
              aria-label="Close sources"
              onClick={() => closeSources()}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <p className="source-drawer-intro">
            {sourceScope
              ? "This reference supports the selected fact."
              : "These references support the claims in this category."}{" "}
            External links open the original publisher or archive in a new tab.
          </p>
          <div className="source-card-list">
            {visibleSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TimeCapsule;
