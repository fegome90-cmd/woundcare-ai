// Frontend contracts for pluggable micro-modules.

export class RecommenderRenderer {
  // render(recommendation: Recommendation) => HTMLElement or string
  render(rec) {
    throw new Error('Not implemented');
  }
}

export class TipsModule {
  // tips(rec: Recommendation) => string[]
  tips(rec) {
    return [];
  }
}

export class DemoFiller {
  // fill(formEl: HTMLElement) => void (mutates form)
  fill(form) {
    throw new Error('Not implemented');
  }
}
