import fs from 'node:fs/promises'
import path from 'node:path'
import type { TreeData } from '../tree'

export const extractFiles = async (name: string, include: string[]): Promise<TreeData[]> => {
	return extract(`./data/${name}`, '', include)
}

const extract = async (dir: string, baseDir: string = '', include: string[]): Promise<TreeData[]> => {
	const data: TreeData[] = []
	const files = await fs.readdir(dir, { withFileTypes: true })

	for (const file of files) {
		if (!include.includes(file.name)) {
			continue
		}
		const filepath = path.join(dir, file.name)
		const relpath = path.join(baseDir, file.name)

		if (file.isDirectory()) {
			const children = await extract(filepath, relpath, include)
			data.push({
				id: relpath,
				title: file.name,
				children,
				code: '',
				language: '',
			})
		} else {
			const language = file.name.split('.').at(-1) ?? ''
			const code = await fs.readFile(filepath, 'utf8')
			data.push({
				id: relpath,
				title: file.name,
				children: [],
				code,
				language,
			})
		}
	}
	return data
}
