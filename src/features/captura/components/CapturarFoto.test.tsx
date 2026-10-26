import type { ReactElement } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import CapturarFoto from "./CapturarFoto";

vi.mock("react", async (original) => ({
	...(await original<typeof import("react")>()),
	useState: (value: unknown) => [value, vi.fn()],
	useRef: () => ({ current: null }),
	useEffect: vi.fn(),
}));

const upload = vi.fn();
function frame(overrides = {}) {
	const tree = CapturarFoto({
		animal: { identificador: "AR-1051" },
		captura: null,
		cargando: false,
		quitandoFoto: false,
		aviso: null,
		error: null,
		onSubirFoto: upload,
		onReintentar: vi.fn(),
		onQuitarFoto: async () => true,
		onProcesarPesaje: vi.fn(),
		...overrides,
	} as unknown as Parameters<typeof CapturarFoto>[0]);
	return tree.props.children[2].props.children[0] as ReactElement<any>;
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal("URL", {
		createObjectURL: vi.fn(() => "blob:photo"),
		revokeObjectURL: vi.fn(),
	});
});

it("uploads a dropped image and prevents browser navigation", () => {
	const file = new File(["photo"], "cow.png", { type: "image/png" });
	const preventDefault = vi.fn();
	frame().props.onDrop({ preventDefault, dataTransfer: { files: [file] } });
	expect(preventDefault).toHaveBeenCalledOnce();
	expect(upload).toHaveBeenCalledExactlyOnceWith(file);
	expect(URL.createObjectURL).toHaveBeenCalledWith(file);
});

it("ignores non-images and drops while busy or already uploaded", () => {
	for (const overrides of [
		{},
		{ cargando: true },
		{ captura: { id: "capture" } },
	]) {
		const file = new File(["data"], "file", {
			type: Object.keys(overrides).length ? "image/png" : "text/plain",
		});
		frame(overrides).props.onDrop({
			preventDefault: vi.fn(),
			dataTransfer: { files: [file] },
		});
	}
	expect(upload).not.toHaveBeenCalled();
	expect(URL.createObjectURL).not.toHaveBeenCalled();
});
