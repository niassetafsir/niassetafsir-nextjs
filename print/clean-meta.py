# -*- coding: utf-8 -*-
"""Set the file properties of every docx in the volume.

A Word file carries an author, a description and a generator string in its
properties. Left alone they name the library that wrote the file. They are
set here to the volume's own details.
"""
import zipfile, shutil, os, sys, glob, re, datetime

AUTHOR = 'Amadu Farouk Kunateh'
TITLE  = 'Fī Riyāḍ al-Tafsīr: Lessons One to Eight'
NOW    = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

CORE = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
 '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"'
 ' xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"'
 ' xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
 '<dc:title>%s</dc:title><dc:subject></dc:subject><dc:creator>%s</dc:creator>'
 '<cp:keywords></cp:keywords><dc:description></dc:description>'
 '<cp:lastModifiedBy>%s</cp:lastModifiedBy><cp:revision>1</cp:revision>'
 '<dcterms:created xsi:type="dcterms:W3CDTF">%s</dcterms:created>'
 '<dcterms:modified xsi:type="dcterms:W3CDTF">%s</dcterms:modified>'
 '<cp:category></cp:category></cp:coreProperties>') % (TITLE, AUTHOR, AUTHOR, NOW, NOW)

DROP = {'docProps/thumbnail.jpeg'}

def clean(path):
    tmp = path + '.tmp'
    zin = zipfile.ZipFile(path)
    zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
    for item in zin.infolist():
        if item.filename in DROP:
            continue
        data = zin.read(item.filename)
        if item.filename == 'docProps/core.xml':
            data = CORE.encode('utf-8')
        elif item.filename == 'docProps/app.xml':
            t = data.decode('utf-8')
            t = re.sub(r'<Application>[^<]*</Application>', '<Application></Application>', t)
            t = re.sub(r'<Company>[^<]*</Company>', '<Company></Company>', t)
            t = re.sub(r'<Template>[^<]*</Template>', '<Template></Template>', t)
            data = t.encode('utf-8')
        elif item.filename == '_rels/.rels':
            t = data.decode('utf-8')
            t = re.sub(r'<Relationship[^>]*thumbnail[^>]*/>', '', t)
            data = t.encode('utf-8')
        zout.writestr(item, data)
    zin.close(); zout.close()
    shutil.move(tmp, path)

if __name__ == '__main__':
    files = sorted(glob.glob(sys.argv[1] if len(sys.argv) > 1
                             else '/home/claude/book2/*/*.docx'))
    for f in files:
        clean(f)
        print('cleaned %s' % os.path.basename(f))
    print('\n%d file(s); creator and description now carry the volume’s own details' % len(files))
