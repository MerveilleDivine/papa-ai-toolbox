import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FAVORITES_KEY, parseFavorites, useFavorites } from "./useFavorites";

describe("favourites", () => {
  it("ignores malformed, duplicate, and unknown stored values", () => {
    expect(parseFavorites("not json")).toEqual([]);
    expect(parseFavorites(JSON.stringify(["chatgpt", "unknown", "chatgpt", 42]))).toEqual(["chatgpt"]);
  });

  it("persists toggles with the current storage key", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite("chatgpt"));

    expect(result.current.favoriteIds).toEqual(["chatgpt"]);
    expect(window.localStorage.getItem(FAVORITES_KEY)).toBe('["chatgpt"]');

    act(() => result.current.toggleFavorite("chatgpt"));
    expect(result.current.favoriteIds).toEqual([]);
  });

  it("updates when another tab changes or clears local storage", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: FAVORITES_KEY,
        newValue: '["chatgpt"]',
        storageArea: window.localStorage,
      }));
    });
    expect(result.current.favoriteIds).toEqual(["chatgpt"]);

    act(() => {
      window.localStorage.clear();
      window.dispatchEvent(new StorageEvent("storage", {
        key: null,
        newValue: null,
        storageArea: window.localStorage,
      }));
    });
    expect(result.current.favoriteIds).toEqual([]);
  });

  it("ignores unrelated session storage events", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite("chatgpt"));
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: FAVORITES_KEY,
        newValue: null,
        storageArea: window.sessionStorage,
      }));
    });

    expect(result.current.favoriteIds).toEqual(["chatgpt"]);
  });
});
